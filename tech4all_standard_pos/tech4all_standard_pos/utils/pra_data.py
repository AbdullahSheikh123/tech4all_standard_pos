
import frappe
from erpnext.controllers.taxes_and_totals import get_itemised_tax_breakup_data

def get_pra_invoice_data(sales_invoice, pra_invoice_id, return_invoice=None):
    pra_data = {
        "InvoiceNumber": sales_invoice.name,
        "POSID": int(pra_invoice_id),
        "USIN": pra_invoice_id + "-" + str(sales_invoice.pos_referrence.replace("Order ", "")),
        "DateTime": "",
        "BuyerPNTN": "1234567-8",
        "BuyerCNIC": "12345-1234567-8",
        "BuyerName": "Buyer Name",
        "BuyerPhoneNumber": "0000-0000000",
        "TotalQuantity": abs(sales_invoice.total_qty),
        "FurtherTax": 0.0,
        "PaymentMode": 1,
        "RefUSIN": "",
        "InvoiceType": 1,
        "TotalBillAmount": abs(sales_invoice.grand_total),
        "TotalSaleValue": abs(sales_invoice.total),
        "TotalTaxCharged": abs(sales_invoice.total_taxes_and_charges),
        "Discount": abs(sales_invoice.discount_amount) if sales_invoice.discount_amount else 0.0,
        "InvoiceItems": get_pra_invoice_items(sales_invoice, pra_invoice_id, return_invoice=return_invoice)
    }

    invoice_type = 1

    # if return_invoice:
    #     invoice_type = 2
    #     pra_data["RefUSIN"] = pra_invoice_id + "-" + str(return_invoice.pos_referrence.replace("Order ", ""))

    pra_data["InvoiceType"] = invoice_type
    return pra_data

def get_pra_invoice_items(sales_invoice, pra_invoice_id, return_invoice=None):
    pra_invoice_items = []
    itemized_tax = get_itemised_tax_breakup_data(sales_invoice)

    for item in sales_invoice.items:
        item_taxes = itemized_tax[0].get(item.item_code, {})

        total_tax = sum([row['tax_amount'] for row in item_taxes.values()])

        pra_invoice_item = {
            "ItemCode": item.item_code,
            "ItemName": item.item_name,
            "Quantity": abs(item.qty),
            "PCTCode": "11001010",
            "TaxCharged": abs(total_tax),
            "Discount": 0,
            "FurtherTax": 0.0,
            "TotalAmount": abs(item.amount),
            "SaleValue": abs(item.amount - total_tax),
            "TaxRate": abs(total_tax),
        }

        invoice_type = 1

        if return_invoice:
            if item.amount < 0:
                invoice_type = 3
                pra_invoice_item["RefUSIN"] = pra_invoice_id + "-" + str(return_invoice.pos_referrence.replace("Order ", ""))
            else:
                invoice_type = 2
                pra_invoice_item["RefUSIN"] = pra_invoice_id + "-" + str(return_invoice.pos_referrence.replace("Order ", ""))
                pra_invoice_item["TaxRate"] = total_tax
                pra_invoice_item["SaleValue"] = item.amount - total_tax
                pra_invoice_item["TotalAmount"] = item.amount


        pra_invoice_item["InvoiceType"] = invoice_type

        pra_invoice_items.append(pra_invoice_item)

    return pra_invoice_items