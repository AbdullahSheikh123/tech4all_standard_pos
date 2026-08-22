// Routes KOT printing: if this branch has QZ Tray configured (at least one
// KDS Station with a printer_name picked), tickets print silently straight
// to each item's station printer via QZ Tray - no print-dialog popup.
// The popup from kotPrint.js only still appears for:
//   - a branch with no QZ Tray configured at all (today's behaviour, unchanged)
//   - items that don't map to any configured station (no Item.kds_ entry,
//     or it points at a station without a printer picked yet)
//   - a station whose QZ Tray call actually fails, so a ticket is never
//     silently lost just because one printer is offline
import { printKot, buildKotHtml } from "./kotPrint.js";

let qz_credentials_cache = {}; // branch -> Promise<{certificate, private_key}>
let qz_current_branch = null;
let qz_connected_host = undefined;
let qz_security_configured = false;

function getQzCredentials(branch) {
    if (!qz_credentials_cache[branch]) {
        qz_credentials_cache[branch] = frappe
            .call("tech4all_pos_general.api.qz_tray_api.get_qz_credentials", { branch })
            .then((r) => r.message);
    }
    return qz_credentials_cache[branch];
}

function ensureQzConnected(host, branch) {
    if (typeof qz === "undefined") {
        return Promise.reject(new Error("QZ Tray browser library did not load (qz-tray.js)."));
    }

    // Read by the cert/signature promises below at call time, so printing to
    // a different branch's station later picks up the right credentials
    // without re-registering the promises.
    qz_current_branch = branch;

    if (!qz_security_configured) {
        // Tells qz-tray.js what to DECLARE as the signing algorithm in each
        // outgoing message - separate from, and must match, the alg used in
        // setSignaturePromise below. Without this, qz-tray.js silently
        // declares its own legacy default (SHA1) regardless of what's
        // actually used to compute the signature, causing every request to
        // fail server-side verification ("Bad signature" in QZ Tray's log)
        // no matter which algorithm the signing code below uses.
        qz.security.setSignatureAlgorithm("SHA1");

        qz.security.setCertificatePromise((resolve, reject) => {
            getQzCredentials(qz_current_branch).then((c) => resolve(c.certificate)).catch(reject);
        });

        qz.security.setSignaturePromise((toSign) => (resolve, reject) => {
            getQzCredentials(qz_current_branch)
                .then((c) => {
                    console.log("[QZ SIGN] private_key starts with:", c.private_key?.slice(0, 30));
                    console.log("[QZ SIGN] private_key length:", c.private_key?.length);
                    console.log("[QZ SIGN] toSign:", toSign);

                    const pk = KEYUTIL.getKey(c.private_key);
                    console.log("[QZ SIGN] parsed key type/bitLength:", pk?.type, pk?.n?.bitLength?.());

                    const sig = new KJUR.crypto.Signature({ alg: "SHA1withRSA" });
                    sig.init(pk);
                    sig.updateString(toSign);
                    const hexSig = sig.sign();
                    console.log("[QZ SIGN] signature hex length:", hexSig.length, "(expect ~1024 for a 2048-bit key with SHA512, or same for SHA1 - hex length is driven by key size, not hash algo)");

                    resolve(stob64(hextorstr(hexSig)));
                })
                .catch((e) => {
                    console.error("[QZ SIGN] signing threw:", e);
                    reject(e);
                });
        });
        qz_security_configured = true;
    }

    if (qz.websocket.isActive() && qz_connected_host === host) {
        return Promise.resolve();
    }

    const reconnect = () => {
        qz_connected_host = host;
        return qz.websocket.connect(host ? { host } : undefined);
    };

    // Already connected, but to a different station's host - drop it first
    // so a later print doesn't go to the wrong machine.
    if (qz.websocket.isActive()) {
        return qz.websocket.disconnect().then(reconnect);
    }
    return reconnect();
}

function getItemFromOfflineDb(itemCode) {
    return new Promise((resolve, reject) => {
        // No version pinned here on purpose - this is a read-only helper, not
        // the schema owner (that's indexedDB.js - see its own DB_VERSION,
        // deliberately not duplicated as a number here since it changes
        // independently of this file). Opening with a hardcoded version
        // that's behind the DB's actual current version throws VersionError
        // on every call.
        const dbRequest = indexedDB.open("OfflineDB");

        dbRequest.onsuccess = (event) => {
            const db = event.target.result;
            try {
                const transaction = db.transaction(["items"], "readonly");
                const store = transaction.objectStore("items");
                const request = store.get(itemCode);

                request.onsuccess = () => resolve(request.result || null);
                request.onerror = () =>
                    reject(request.error?.name + ": " + request.error?.message);
            } catch (e) {
                // e.g. DOMException: "items" object store doesn't exist yet
                reject(e.name + ": " + e.message);
            }
        };

        dbRequest.onerror = () =>
            reject(
                "Error opening IndexedDB: " +
                    (dbRequest.error?.name + ": " + dbRequest.error?.message)
            );
    });
}

const KDS_STATIONS_CACHE_MAX_AGE_MS = 15 * 60 * 1000; // 15 min

// Fast-load cache for get_kds_stations_for_branch, read/written with the
// same unversioned indexedDB.open() pattern as getItemFromOfflineDb above
// (see that function's comment - avoids a VersionError if this bundle and
// indexedDB.js's DB_VERSION ever drift). This is config data (which printer
// serves which kitchen station), not per-order data, so caching it doesn't
// carry the same conflict risk as e.g. stock counts - the only real risk is
// serving a stale printer assignment for up to maxAgeMs after someone
// reassigns a station in the Desk, which just misroutes one ticket rather
// than losing or duplicating a sale.
function getKdsStationsFromCache(branch, maxAgeMs = KDS_STATIONS_CACHE_MAX_AGE_MS) {
    return new Promise((resolve) => {
        const dbRequest = indexedDB.open("OfflineDB");
        dbRequest.onsuccess = (event) => {
            const db = event.target.result;
            try {
                const transaction = db.transaction(["kds_stations"], "readonly");
                const store = transaction.objectStore("kds_stations");
                const request = store.get(branch);
                request.onsuccess = () => {
                    const record = request.result;
                    if (!record || Date.now() - record.cached_at > maxAgeMs) {
                        resolve(null);
                        return;
                    }
                    resolve(record.stations);
                };
                request.onerror = () => resolve(null);
            } catch (e) {
                // e.g. "kds_stations" object store doesn't exist yet (older
                // cached DB_VERSION) - just treat as a cache miss.
                resolve(null);
            }
        };
        dbRequest.onerror = () => resolve(null);
    });
}

function saveKdsStationsToCache(branch, stations) {
    const dbRequest = indexedDB.open("OfflineDB");
    dbRequest.onsuccess = (event) => {
        const db = event.target.result;
        try {
            const transaction = db.transaction(["kds_stations"], "readwrite");
            transaction.objectStore("kds_stations").put({
                branch,
                stations,
                cached_at: Date.now(),
            });
        } catch (e) {
            console.error("[QZ KOT] Could not cache KDS stations:", e);
        }
    };
}

// Splits kot_items into { byStation, unmapped } using each item's
// Item.kds_ child table (kds_station links), keeping only stations that are
// actually configured (passed in via `stations`).
async function groupItemsByStation(kotItems, stations) {
    const configuredNames = new Set(stations.map((s) => s.name));
    const byStation = {};
    const unmapped = [];

    for (const item of kotItems) {
        let itemDoc = null;
        try {
            itemDoc = await getItemFromOfflineDb(item.item_code);
        } catch (e) {
            console.error("Could not look up item for KDS routing:", item.item_code, e);
        }

        const matchedStations = (itemDoc?.kds_ || [])
            .map((row) => row.kds_station)
            .filter((name) => name && configuredNames.has(name));

        if (!matchedStations.length) {
            unmapped.push(item);
            continue;
        }
        for (const stationName of matchedStations) {
            (byStation[stationName] ||= []).push(item);
        }
    }

    return { byStation, unmapped };
}

export async function printKotSmart(offlineData, branch) {
    console.log("[QZ KOT] branch:", branch);
    if (!branch) {
        console.warn(
            "[QZ KOT] No branch on this POS Profile (pos_profile.custom_branch is empty) - " +
            "falling back to the print-dialog popup for everything."
        );
        return printKot(offlineData);
    }

    let stations = await getKdsStationsFromCache(branch);
    if (stations) {
        console.log("[QZ KOT] configured stations for this branch (cached):", stations);
    } else {
        stations = [];
        try {
            const r = await frappe.call(
                "tech4all_pos_general.api.qz_tray_api.get_kds_stations_for_branch",
                { branch }
            );
            stations = r.message || [];
            saveKdsStationsToCache(branch, stations);
        } catch (e) {
            console.error("[QZ KOT] Could not load KDS stations for branch", branch, e);
        }
        console.log("[QZ KOT] configured stations for this branch (fetched):", stations);
    }

    if (!stations.length) {
        console.warn(
            `[QZ KOT] No KDS Station for branch "${branch}" has printer_name set - ` +
            "falling back to the print-dialog popup for everything."
        );
        return printKot(offlineData);
    }

    const kotItems = offlineData?.kot_items || [];
    const { byStation, unmapped } = await groupItemsByStation(kotItems, stations);
    console.log("[QZ KOT] items routed by station:", byStation, "unmapped:", unmapped);
    const fallbackItems = [...unmapped];

    for (const station of stations) {
        const stationItems = byStation[station.name];
        if (!stationItems || !stationItems.length) continue;

        try {
            await ensureQzConnected(station.qz_host, branch);
            const html = buildKotHtml({ ...offlineData, kot_items: stationItems });
            const config = qz.configs.create(station.printer_name);
            await qz.print(config, [{ type: "html", format: "plain", data: html }]);
            console.log(`[QZ KOT] printed silently to station ${station.name} (${station.printer_name})`);
        } catch (err) {
            console.error(`[QZ KOT] QZ Tray print failed for station ${station.name}:`, err);
            fallbackItems.push(...stationItems);
        }
    }

    if (fallbackItems.length) {
        console.warn("[QZ KOT] popup firing for these leftover/failed items:", fallbackItems);
        await printKot({ ...offlineData, kot_items: fallbackItems });
    }
}
