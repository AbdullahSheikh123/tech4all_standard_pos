export async function sync_fbr(invoice_doc, pos_profile,sync_type) {
    console.log("Sync FBR: Start", { invoice_doc, pos_profile });

    try {
        if (pos_profile.custom_enable_fbr) {
            console.log("FBR Integration Enabled. Preparing Order Data...");
            const order_data = get_order_data_for_fbr(invoice_doc, pos_profile,sync_type);
            console.log("Order Data for FBR:", order_data);

            const fbr_resp = await get_fbr_invoice_id(pos_profile, order_data);
            console.log("FBR Response:", fbr_resp);

            if (fbr_resp && fbr_resp.Code === "100") {
                console.log("FBR Invoice Generated Successfully:", fbr_resp.InvoiceNumber);

                if (invoice_doc) {
                    invoice_doc.fbr_invoice_id = fbr_resp.InvoiceNumber || "000000000";
                    console.log("Assigned FBR Invoice Number to Document:", invoice_doc.fbr_invoice_id);

                    try {
                        console.log("Fetching QR Code Data...");
                        const qr_resp = await fetchQRData(invoice_doc.fbr_invoice_id, invoice_doc.name,sync_type);
                        console.log("QR Code Response:", qr_resp);
                        return qr_resp; // Success
                    } catch (error) {
                        console.error("Error Fetching QR Code Data:", error);
                        return 500; // Failure due to QR code fetch error
                    }
                } else {
                    console.error("Invoice Document or Message is Undefined.");
                    return 500; // Failure due to undefined invoice document
                }
            } else {
                console.error("Failed to Generate FBR Invoice Number.", { response: fbr_resp });
                return 500; // Failure due to unsuccessful FBR response
            }
        } else {
            console.log("FBR Integration is Disabled.");
            return 500; // Failure due to FBR integration being disabled
        }
    } catch (error) {
        console.error("Error During FBR Synchronization:", error);
        return 500; // Failure due to general error
    }
}

// Helper function to fetch a document based on doctype and filters
async function fetchDocument(doctype, filters) {
    console.log("Fetching Document:", { doctype, filters });

    try {
        const response = await frappe.call({
            method: 'frappe.client.get',
            args: { doctype, filters }
        });
        console.log("Document Fetched Successfully:", response);
        return response;
    } catch (error) {
        console.error(`Error Fetching ${doctype} Document:`, error);
        throw new Error(`Failed to fetch ${doctype} document: ${error.message}`);
    }
}
import QRCode from 'qrcode';
// Helper function to fetch QR code data for the invoice
async function fetchQRData(fbr_invoice_no, sales_invoice_name,sync_type) {

    console.log("Fetching QR Data:", { fbr_invoice_no, sales_invoice_name });

    if(sync_type == true){
        const response = {
            message: "",
            qrCode: "",
            fbrInvoiceId: fbr_invoice_no,
            salesInvoiceName: sales_invoice_name
        };
        
        try {
            const qrCodeDataURL = await QRCode.toDataURL(fbr_invoice_no, { scale: 8 });
            response.qrCode = qrCodeDataURL;
            response.message = "Invoice updated successfully";
            
        } catch (error) {
            response.message = `Error: ${error.message}`;
        }
    
        return response;  
    }
else{
    try {
        const response = await frappe.call({
            method: 'tech4all_standard_pos.tech4all_standard_pos.api.update_invoice_tax.get_qr_data',
            args: { fbr_invoice_no, sales_invoice_name }
        });
        console.log("QR Data Fetched Successfully:", response);
        return response;
    } catch (error) {
        console.error("Error Fetching QR Data:", error);
        throw new Error(`Failed to fetch QR data: ${error.message}`);
    }
}
   
}

// Function to generate order data for FBR
function get_order_data_for_fbr(invoice_doc, branch_doc, sync_type) {
    console.log("Generating Order Data for FBR...");

    const items_data = get_items_list_for_fbr(invoice_doc, invoice_doc.ref_usin);
    const fbr_id = branch_doc.custom_fbr_pos_id;
    const postingDate = invoice_doc.posting_date;
    
    // Fetch current time if posting_time does not exist
    const postingTime = invoice_doc.posting_time || new Date().toTimeString().split(' ')[0];
    const fbr_date = `${postingDate.toString()} ${postingTime}`;
    const referenceKey = sync_type === true ? invoice_doc.pos_referrence : invoice_doc.name;
    const usin = `${fbr_id}-${referenceKey}`;
    console.log("Generated USIN:", usin);

    console.log("FBR Date:", fbr_date, "USIN:", usin);

    let data = {};

    switch (branch_doc.custom_authority) {
        case "FBR":
        case "PRA":
            data = {
                InvoiceNumber: "",
                POSID: parseInt(fbr_id),
                USIN: usin,
                DateTime: fbr_date,
                BuyerPNTN: "1234567-8",
                BuyerCNIC: "12345-1234567-8",
                BuyerName: "Buyer Name",
                BuyerPhoneNumber: "0000-0000000",
                TotalBillAmount: Math.abs(invoice_doc.rounded_total),
                TotalQuantity: Math.abs(invoice_doc.total_qty),
                TotalSaleValue: Math.abs(invoice_doc.total),
                TotalTaxCharged: Math.abs(invoice_doc.total_taxes_and_charges),
                Discount: invoice_doc.discount_amount || 0.0,
                FurtherTax: 0.0,
                PaymentMode: 1,
                RefUSIN: "",
                InvoiceType: 1,
                Items: items_data
            };
            break;

        case "SRB":
            data = {
                posId: parseInt(fbr_id),
                name: "",
                invoiceDateTime: fbr_date,
                saleValue: Math.abs(invoice_doc.total_qty),
                taxAmount: Math.abs(invoice_doc.total),
                consumerName: "Buyer Name",
                Items: items_data
            };
            break;

        default:
            console.error("Unknown Authority:", branch_doc.custom_authority);
            break;
    }

    console.log("Generated Order Data:", data);
    return data;
}

// Function to prepare item data for FBR
function get_items_list_for_fbr(invoice_doc, refUSIN) {
    console.log("Preparing Items List for FBR...");
    const items_data = invoice_doc.items.map(item => ({
        ItemCode: item.item_code,
        ItemName: item.item_name,
        Quantity: Math.abs(item.qty),
        TaxRate: Math.abs(item.item_tax_rate) || 0.0,
        SaleValue: Math.abs(item.net_amount),
        TotalAmount: Math.abs(item.amount),
        Discount: Math.abs(item.discount_amount) || 0.0,
        FurtherTax: 0.0,
        TaxCharged: 0.0,
        PCTCode: "11001010",
        RefUSIN: refUSIN || "",
        InvoiceType: refUSIN ? 2 : 1
    }));
    console.log("Items List Prepared:", items_data);
    return items_data;
}

// Function to fetch FBR invoice ID
async function get_fbr_invoice_id(branch_doc, orderData) {
    console.log("Fetching FBR Invoice ID...");
    const fbrHost = branch_doc.custom_fbr_host;
    let url = branch_doc.custom_authority === "SRB"
        ? `http://${fbrHost || "localhost"}:8282/SalesInvoiceService`
        : `http://${fbrHost || "localhost"}:8524/api/IMSFiscal/GetInvoiceNumberByModel`;

    console.log("FBR API URL:", url, "Order Data:", orderData);

    try {
        const response = await $.ajax({
            url,
            type: "POST",
            data: JSON.stringify(orderData),
            dataType: "json",
            cache: false,
            contentType: "application/json; charset=utf-8",
            processData: false
        });
        console.log("FBR Invoice ID Fetched Successfully:", response);
        return response;
    } catch (error) {
        console.error("Error Fetching FBR Invoice ID:", error);
        return null;
    }
}
