import frappe
from frappe.model.document import Document
from pyqrcode import create as qrcreate
import io
import base64

import io
import base64


@frappe.whitelist()
def get_qr_data(fbr_invoice_no, sales_invoice_name):
    url = qrcreate(fbr_invoice_no)
    response = {
        "message": "",
        "qr_code": "",
        "fbr_invoice_id": fbr_invoice_no,
        "sales_invoice_name": sales_invoice_name
    }
    
    try:
        with io.BytesIO() as stream:
            url.png(stream, scale=8)
            encoded = base64.b64encode(stream.getvalue()).decode()
            response["qr_code"] = "data:image/png;base64," + encoded
            
    except Exception as e:
        response["message"] = f"Error generating QR code: {e}"
        return response 

    try:
        sales_invoice = frappe.get_doc("Sales Invoice", sales_invoice_name)
        sales_invoice.fbr_invoice_id = fbr_invoice_no
        sales_invoice.qr_code = encoded
        
        sales_invoice.flags.ignore_validate_update_after_submit = True
        sales_invoice.submit()
        
        response["message"] = "Invoice updated successfully"
        response["sales_invoice"] = sales_invoice.as_dict() 
        
    except Exception as e:
        response["message"] = f"Error updating Sales Invoice: {e}"
    
    return response

