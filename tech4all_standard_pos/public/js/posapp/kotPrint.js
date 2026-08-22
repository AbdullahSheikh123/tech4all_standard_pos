2// Builds the default KOT ticket HTML for a given set of items. Shared by
// the print-dialog popup below and by qzKotPrint.js's silent QZ Tray path,
// so both render the exact same layout - QZ Tray printing isn't a
// different ticket design, just a different delivery mechanism for it.
export function buildKotHtml(offlineData) {
    const items = offlineData?.kot_items || [];

    // Group items by name
    const groupedItems = {};
    items.forEach(item => {
        if (!groupedItems[item.name]) {
            groupedItems[item.name] = {
                name: item.name,
                qty: 0,
                rate: item.rate || 0,
                bundle_items: []
            };
        }
        groupedItems[item.name].qty += item.qty || 0;
        if (item.bundle_items?.length) {
            groupedItems[item.name].bundle_items.push(...item.bundle_items);
        }
    });

    const itemRows = Object.values(groupedItems).map(item => {
        const parentRow = `
            <tr class="parent-row">
                <td><strong>${item.name}</strong></td>
                <td class="text-center"><strong>${item.qty}</strong></td>
                <td class="text-right"><strong>Rs ${item.rate}</strong></td>
            </tr>
        `;

        const bundleRows = item.bundle_items.map(b => `
            <tr class="child-row">
                <td style="padding-left: 20px;">- ${b.name}</td>
                <td></td>
                <td></td>
            </tr>
        `).join("");

        return parentRow + bundleRows;
    }).join("");

    return `
<html>
<head>
    <title>KOT-Print</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 14px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th {
            border: 2px solid black;
            padding: 5px;
        }
        .parent-row td {
            border: 2px solid black;
            padding: 5px;
        }
        .child-row td {
            border: none;
            padding-left: 20px;
            padding-top: 2px;
            padding-bottom: 2px;
        }
        .text-center {
            text-align: center;
        }
        .text-right {
            text-align: right;
        }
        .header, .footer {
            text-align: center;
            margin: 8px 0;
        }
        .logo {
            width: 50%;
        }
        .header div {
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <div><strong>Standard</strong></div>
        <p class="text-center" style="margin-bottom: 0.25rem">KOT-PRINT</p>
        ${offlineData?.bill_no ? `<p class="text-center" style="margin: 0 0 0.25rem"><strong>Bill No: ${offlineData.bill_no}</strong></p>` : ""}
    </div>

    <table>
        <thead>
            <tr>
                <th>Item</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Rate</th>
            </tr>
        </thead>
        <tbody>
            ${itemRows}
        </tbody>
    </table>

    <div class="footer">
        <p><strong>Thank you for your visit!</strong></p>
        <hr>
        <p>Prepared by Tech4All</p>
    </div>
</body>
</html>
      `;
}

export async function printKot(offlineData) {
    try {
        const newWindow = window.open("", "_blank");
        if (!newWindow) {
            // window.open() returns null when the browser's popup blocker
            // steps in - happens here because printKotSmart() runs several
            // awaits (frappe.call, IndexedDB lookups) before falling back
            // to this popup, so by the time we get here it's no longer
            // treated as a direct, trusted response to the click.
            console.error(
                "printKot: window.open() was blocked by the browser's popup blocker."
            );
            frappe.show_alert({
                message: __(
                    "KOT print popup was blocked by your browser. Please allow popups for this site and try again."
                ),
                indicator: "red",
            });
            return;
        }
        newWindow.document.write(buildKotHtml(offlineData));
        newWindow.document.close();

      // Add event listener for after printing
      newWindow.onafterprint = () => {
        newWindow.close();
      };

      // Open the print dialog
      newWindow.print();

      // Fallback for browsers that don't support onafterprint
      newWindow.addEventListener("focus", () => {
        setTimeout(() => {
          newWindow.close();
        }, 500); // Adjust delay if necessary
      });
    } catch (error) {
      console.error("Error printing invoice:", error);
    }
}
