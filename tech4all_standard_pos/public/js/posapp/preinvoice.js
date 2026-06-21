export async function printPreInvoice(offlineData) {
    try {
        const cartItems = offlineData?.cart_items || [];

        const cartItemRows = cartItems.map(cartItem => {
            const bundleItems = cartItem.bundle_items?.map(bundle =>
                `<div style="margin-left: 15px;">- ${bundle.item_name}</div>`
            ).join('') || '';

            return `
                <tr>
                    <td>${cartItem.item_name}</td>
                    <td class="text-center">${cartItem.qty}</td>
                    <td class="text-right">${cartItem.rate}</td>
                </tr>
                <tr>
                    <td colspan="3">${bundleItems}</td>
                </tr>
            `;
        }).join('');

        const newWindow = window.open("", "_blank");

        newWindow.document.write(`
  <html>
  <head>
      <title>Pre-Invoice</title>
      <style>
          .print-format table, .print-format tr, .print-format td, .print-format div, .print-format p {
              line-height: 100%;
              vertical-align: middle;
          }
          @media screen {
              .print-format {
                  width: 4in;
                  padding: 0.25in;
                  min-height: 8in;
              }
          }
          .print-format td, .print-format th {
              padding: 5px !important;
          }
          table {
              width: 100%;
              border-collapse: collapse;
          }
          th, td {
              border: 1px solid black;
              padding: 5px;
              text-align: left;
          }
          .text-center {
              text-align: center;
          }
          .text-right {
              text-align: right;
          }
          .header {
              text-align: center;
              margin-bottom: 10px;
          }
          .header img {
              width: 30%;
          }
          .header div {
              font-size: 18px;
              font-weight: bold;
          }
          .header p {
              margin-bottom: 0.25rem;
              font-size: 16px;
          }
          .location {
              text-align: center;
              font-size: 14px;
          }
      </style>
  </head>
  <body>
      <div class="header">
        
        <div>Standard</div>
        <p class="text-center"><strong>PRE INVOICE</strong></p>
    </div>

      <table>
          <thead>
              <tr style="background-color: #e0e0e0;">
                  <th>Item Name</th>
                  <th class="text-center">Qty</th>
                  <th class="text-right">Rate</th>
              </tr>
          </thead>
          <tbody>
              ${cartItemRows}
              <tr><td colspan="3"><hr></td></tr>
              <tr>
                  <td colspan="2"><b>Bill Excl. GST</b></td>
                  <td class="text-right">${offlineData.total.toFixed(2)}</td>
              </tr>
              <tr>
                  <td colspan="2"><b>GST @ 16%</b></td>
                  <td class="text-right">${offlineData.gstAmountCash.toFixed(2)}</td>
              </tr>
              <tr>
                  <td colspan="2"><b>Total Incl. 16%</b></td>
                  <td class="text-right">${offlineData.grand_total.toFixed(2)}</td>
              </tr>
              <tr>
                  <td colspan="2"><b>GST @ 5%</b></td>
                  <td class="text-right">${offlineData.gstAmountCard.toFixed(2)}</td>
              </tr>
              <tr>
                  <td colspan="2"><b>Total Incl. 5%</b></td>
                  <td class="text-right">${offlineData.grand_total_card.toFixed(2)}</td>
              </tr>
          </tbody>
      </table>

      <p class="text-center" style="margin-top: 10px;"><b>Thank you for your visit!</b></p>
      <hr>
      <p class="text-center" style="margin-top: -10px;">Prepared by Tech4All</p>
  </body>
  </html>
        `);
        newWindow.document.close();

        // After print, close the window
        newWindow.onafterprint = () => {
            newWindow.close();
        };

        // Trigger print
        newWindow.print();

        // Fallback close for browsers that don’t support onafterprint
        newWindow.addEventListener("focus", () => {
            setTimeout(() => {
                newWindow.close();
            }, 500);
        });

    } catch (error) {
        console.error("Error printing invoice:", error);
    }
}
