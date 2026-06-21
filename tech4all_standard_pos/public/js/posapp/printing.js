// Store the document and user data globally or within a specific scope
let doc = null;
let usr = null;
let pos_profile = null;
let pos_setting = null;
let pos_opening_shift = null;



// Method to fetch invoice data from IndexedDB
async function fetchInvoiceData(invoiceId) {
  return new Promise((resolve, reject) => {
    let dbRequest = indexedDB.open('OfflineDB', 1); // Use your actual DB name

    dbRequest.onsuccess = (event) => {
      let db = event.target.result;
      let transaction = db.transaction(['create_invoice'], 'readonly'); // Replace 'create_invoice' with your store name
      let store = transaction.objectStore('create_invoice');
      let request = store.get(invoiceId);
      console.log("get-request",request)

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('Error fetching invoice data');
    };

    dbRequest.onerror = () => reject('Error opening IndexedDB');
  });
}

// Method to fetch pos_profile data from IndexedDB
async function fetchPosProfile(pos_profile) {
  return new Promise((resolve, reject) => {
    let dbRequest = indexedDB.open('OfflineDB', 1); // Use your actual DB name

    dbRequest.onsuccess = (event) => {
      let db = event.target.result;
      let transaction = db.transaction(['pos_profile'], 'readonly'); // Replace 'create_invoice' with your store name
      let store = transaction.objectStore('pos_profile');
      let request = store.get(pos_profile);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('Error fetching pos_profile data');
    };

    dbRequest.onerror = () => reject('Error opening IndexedDB');
  });
}

// Method to fetch pos_settings data from IndexedDB
async function fetchPosSetting() {
  return new Promise((resolve, reject) => {
    let dbRequest = indexedDB.open('OfflineDB', 1); // Use your actual DB name

    dbRequest.onsuccess = (event) => {
      let db = event.target.result;
      let transaction = db.transaction(['pos_settings'], 'readonly'); // Replace 'create_invoice' with your store name
      let store = transaction.objectStore('pos_settings');
      let request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('Error fetching pos_setting data');
    };

    dbRequest.onerror = () => reject('Error opening IndexedDB');
  });
}

// Method to fetch pos_opening_shift data from IndexedDB
async function fetchPosOpeningShift(data) {
  return new Promise((resolve, reject) => {
    let dbRequest = indexedDB.open('OfflineDB', 1); // Use your actual DB name

    dbRequest.onsuccess = (event) => {
      let db = event.target.result;
      let transaction = db.transaction(['pos_opening_shift'], 'readonly'); // Replace 'create_invoice' with your store name
      let store = transaction.objectStore('pos_opening_shift');
      let request = store.get(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('Error fetching pos_opening_shift data');
    };

    dbRequest.onerror = () => reject('Error opening IndexedDB');
  });
}

// Method to items data from IndexedDB
async function fetchitems(data) {
  return new Promise((resolve, reject) => {
    let dbRequest = indexedDB.open('OfflineDB', 1); // Use your actual DB name

    dbRequest.onsuccess = (event) => {
      let db = event.target.result;
      let transaction = db.transaction(['items'], 'readonly');
      let store = transaction.objectStore('items');
      let request = store.get(data);

      request.onsuccess = () => {
        const item = request.result;
        if (item && item.item_name) {
          resolve(item.item_name); // Return the item's name if it exists
        } else {
          reject(`Item with ID ${data} not found`);
        }
      };

      request.onerror = () => reject('Error fetching item data');
    };

    dbRequest.onerror = () => reject('Error opening IndexedDB');
  });
}

// Method to fetch user data
async function fetchUserData(userId) {
  return new Promise((resolve, reject) => {
    // Replace with actual logic to fetch user data from IndexedDB or an API
    resolve({
      full_name: userId // Replace with actual data from IndexedDB or API
    });
  });
}

async function getAllItems(items) {
  // Assuming items is an array of itemId objects
  let itemPromises = items.map(item => fetchitems(item.item_code)); // Collect all item promises
  let itemNames = await Promise.all(itemPromises); // Await for all item names
  return itemNames; // Return an array of item names
}

// Method to open a new window and print the invoice
export async function printInvoice(invoiceId, offline_paid_amount, offline_paid_change,offlineData,fbr) {
  try {
    // Fetch the document and user data from IndexedDB
    console.log("invoiceId",invoiceId)
        console.log("offline_paid_amount",offline_paid_amount)

    // doc = await fetchInvoiceData(invoiceId[0]);    
    console.log("offline-print doc data.....",doc)
    console.log("offline-print fbr.....",fbr)

    // pos_profile = await fetchPosProfile(doc.invoice.pos_profile);
    // pos_setting = await fetchPosSetting();
    // pos_opening_shift = await fetchPosOpeningShift(doc.invoice.posa_pos_opening_shift);
    // usr = await fetchUserData(pos_opening_shift.user);
    // let itemNames = await getAllItems(doc.invoice.items);
    let now = new Date();


    // Create a new window
    const newWindow = window.open("", "_blank");

    // Set the HTML content of the new window
    newWindow.document.write(`
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                font-size: 14px;
                margin: 0;
                padding: 0;
                color: #000;
            }

            .invoice-container {
                width: 100%;
                max-width: 900px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #ddd;
            }

            .header {
                text-align: center;
                margin-bottom: 20px;
            }

            .header img {
                max-width: 160px;
                max-height: 140px;
            }

            .invoice-details {
                width: 100%;
                margin-bottom: 20px;
                font-size: 10px;
            }

            .invoice-details table {
                width: 100%;
                border-collapse: collapse;
            }

            .invoice-details td {
                padding: 8px;
                vertical-align: top;
            }

            .invoice-details .label {
                font-weight: bold;
                width: 30%;
            }

            .invoice-details .value {
                width: 70%;
            }

            .items-table {
                width: 90%;
                border-collapse: collapse;
                margin: 10px auto;
            }

            .items-table th, .items-table td {
                border: 1px solid #000;
                padding: 10px; 
                text-align: center;
            }

            .items-table th {
                background-color: #99a0a829;
                font-weight: bold;
            }

            .footer {
                margin-top: 20px;
                text-align: center;
                font-size: 12px;
            }

            .footer p {
                margin: 5px 0;
            }

            /* Print styles */
            @media print {
                body {
                    margin: 0;
                    padding: 0;
                    font-size: 12px; 
                }

                .invoice-container {
                    border: none; 
                    width: 100%; 
                }

                .items-table th, .items-table td {
                    border: 3px solid #000 !important;
                    line-height: 100%; 
                }

                button {
                    display: none; 
                }
                @page {
                    size: A4 portrait;
                    margin: 20mm;
                }
            }
        </style>
    </head>
    <body>

       <div style="line-height: 1.5; text-align: center;">
    <div style="text-align: center;">
            <img src="/assets/tech4all_standard_pos/js/posapp/components/pos/client_logo.png" alt="Random Image"/>
        <div style="width: 28%; margin: 10px auto;">
        </div>
    </div>
    <div style="width: 55%; margin: 0 auto; text-align: left; line-height: 1.5;">
        <table style="width: 100%; font-size:12px; line-height: 0.7;">
            ${offlineData.items.map((item, index) => `
               <tr>
                    <td colspan="2" style="width: 75%; font-weight: bold;">${item.item_name}</td>
                    <td style="width: 25%; text-align: right;"></td>
                </tr>
                <tr>
                    <td>${item.qty}Piece x ${item.rate.toFixed(2)} Rs.</td>
                    <td></td>
                    <td style="text-align: right;">${item.qty*item.rate.toFixed(2)} Rs</td>
                </tr>
                `).join("")}

        </table>
        <div style="padding-left:10px; padding-right:10px" > 
        <div style="display: flex;flex-direction: row; justify-content: space-between;">
            <p>Subtotal</p>
            <p>${offlineData.total.toFixed(2)} Rs</p>
        </div>  
        <div style="display: flex;flex-direction: row; justify-content: space-between;">
            <p>Sale Tax</p>
            <p style="text-decoration: underline; text-decoration-style: dotted;">${offlineData.total_taxes_and_charges} Rs</p>
        </div>
        
        <h3 style="text-align: right;" >Total &nbsp; &nbsp; &nbsp; &nbsp;  ${offlineData.grand_total} RS</h3>
  
            <!-- Dynamic Payment Modes -->
                ${offlineData.payments.filter(payment => payment.amount > 0).map(payment => `
                    <div style="display: flex; flex-direction: row; justify-content: space-between;">
                        <p>${payment.mode_of_payment}</p>
                        <p>${Number(payment.amount).toFixed(2)} Rs</p>
                    </div>
                `).join("")} 
        </div>
        </div>
        <p style="margin-top:30px;" >FBR id # ${fbr.fbrInvoiceId}</p>
                <img id="qrCodeImg" src="${fbr.qrCode}" alt="FBR QR Code" style="height: 90px;"/>


        <p style="margin-top:30px;" >Thank you for your visit!
        <br>Prepared by Tech4All
        </p>

</div>

    </body>
    </html>

    `);

    // Close the document to trigger rendering in the new window
    const qrCodeImg = newWindow.document.getElementById("qrCodeImg");

    qrCodeImg.onload = () => {
      newWindow.document.close();
      newWindow.focus();
      newWindow.print();
    };

    qrCodeImg.onerror = () => {
      console.error("Error loading QR code image.");
      newWindow.document.close();
      newWindow.focus();
      newWindow.print(); // Optionally print without the QR code
    };
  } catch (error) {
    console.error("Error printing invoice:", error);
  }
}