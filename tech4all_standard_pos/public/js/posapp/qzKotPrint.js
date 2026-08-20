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
        qz.security.setCertificatePromise((resolve, reject) => {
            getQzCredentials(qz_current_branch).then((c) => resolve(c.certificate)).catch(reject);
        });

        qz.security.setSignaturePromise((toSign) => (resolve, reject) => {
            getQzCredentials(qz_current_branch)
                .then((c) => {
                    const pk = KEYUTIL.getKey(c.private_key);
                    const sig = new KJUR.crypto.Signature({ alg: "SHA512withRSA" });
                    sig.init(pk);
                    sig.updateString(toSign);
                    resolve(stob64(hextorstr(sig.sign())));
                })
                .catch(reject);
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
        const dbRequest = indexedDB.open("OfflineDB", 1);

        dbRequest.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(["items"], "readonly");
            const store = transaction.objectStore("items");
            const request = store.get(itemCode);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject("Error fetching item data");
        };

        dbRequest.onerror = () => reject("Error opening IndexedDB");
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
    if (!branch) {
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
        console.error("Could not load KDS stations for branch", branch, e);
    }

    if (!stations.length) {
        // QZ isn't configured for this branch at all - unchanged behaviour.
        return printKot(offlineData);
    }

    const kotItems = offlineData?.kot_items || [];
    const { byStation, unmapped } = await groupItemsByStation(kotItems, stations);
    const fallbackItems = [...unmapped];

    for (const station of stations) {
        const stationItems = byStation[station.name];
        if (!stationItems || !stationItems.length) continue;

        try {
            await ensureQzConnected(station.qz_host, branch);
            const html = buildKotHtml({ ...offlineData, kot_items: stationItems });
            const config = qz.configs.create(station.printer_name);
            await qz.print(config, [{ type: "html", format: "plain", data: html }]);
        } catch (err) {
            console.error(`QZ Tray print failed for station ${station.name}:`, err);
            fallbackItems.push(...stationItems);
        }
    }

    if (fallbackItems.length) {
        await printKot({ ...offlineData, kot_items: fallbackItems });
    }
}
