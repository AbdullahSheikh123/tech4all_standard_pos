import frappe

@frappe.whitelist()
def sales_order_on_submit(doc, method):
    frappe.publish_realtime('sales_order_created', {
        'order_name': doc.name,
        'branch': doc.branch  
    })
