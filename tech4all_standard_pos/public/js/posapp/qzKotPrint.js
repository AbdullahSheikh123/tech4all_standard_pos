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
        // the schema owner (that's indexedDB.js, currently at DB_VERSION 2).
        // Opening with a hardcoded version that's behind the DB's actual
        // current version throws VersionError on every call.
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

    let stations = [];
    try {
        const r = await frappe.call(
            "tech4all_pos_general.api.qz_tray_api.get_kds_stations_for_branch",
            { branch }
        );
        stations = r.message || [];
    } catch (e) {
        console.error("[QZ KOT] Could not load KDS stations for branch", branch, e);
    }
    console.log("[QZ KOT] configured stations for this branch:", stations);

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
