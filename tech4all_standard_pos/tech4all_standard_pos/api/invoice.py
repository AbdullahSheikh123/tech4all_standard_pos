# -*- coding: utf-8 -*-
# For license information, please see license.txt


from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.model.mapper import get_mapped_doc
from frappe.utils import flt, add_days
from tech4all_standard_pos.tech4all_standard_pos.doctype.pos_coupon.pos_coupon import update_coupon_code_count
from tech4all_standard_pos.tech4all_standard_pos.api.posapp import get_company_domain
from tech4all_standard_pos.tech4all_standard_pos.doctype.delivery_charges.delivery_charges import (
    get_applicable_delivery_charges,
)


def validate(doc, method):
    validate_shift(doc)
    set_business_date(doc)
    set_patient(doc)
    auto_set_delivery_charges(doc)
    calc_delivery_charges(doc)
    set_mode_of_payment(doc)


def set_business_date(doc):
    """Trading-day the invoice belongs to, separate from posting_date (which
    stays the real transaction timestamp for accounting/tax purposes and
    keeps rolling to the next calendar day past midnight). Derived from the
    POS Opening Shift - validate_shift() above guarantees posa_pos_opening_shift
    is set by the time this runs for any is_pos invoice - so an order rung up
    at 2am still reports under the night the shift opened, not tomorrow.
    """
    if doc.get("posa_pos_opening_shift"):
        doc.custom_business_date = frappe.get_cached_value(
            "POS Opening Shift", doc.posa_pos_opening_shift, "posting_date"
        )
    else:
        # No shift context (e.g. a non-POS invoice) - fall back to the real
        # posting date rather than leaving it blank.
        doc.custom_business_date = doc.posting_date


def set_mode_of_payment(doc):
    # The top-level Mode of Payment field is never filled in by the POS
    # submission flow (only the child Payments table rows get a mode of
    # payment), and the desk's client-side auto-fill doesn't run for
    # invoices created via the API. Mirror that behaviour here: when there
    # is exactly one payment row, use its mode; leave it blank for zero or
    # multiple modes rather than guessing.
    if not doc.is_pos:
        return
    if doc.payments and len(doc.payments) == 1:
        doc.mode_of_payment = doc.payments[0].mode_of_payment


def before_submit(doc, method):
    if doc.is_return and not doc.is_pos:
        doc.is_pos = 1

    if doc.pos_profile:
        pos_profile = frappe.get_cached_doc("POS Profile", doc.pos_profile)
        
        if pos_profile:
            if doc.cost_center != pos_profile.cost_center:
                doc.cost_center = pos_profile.cost_center
    if doc.is_pos:
        if doc.pos_profile:
            # Read the Branch straight off the POS Profile's own custom_branch
            # link instead of reverse-searching Branch by a fuzzy "like" match
            # on its pos_profile field - that match was unreliable (relied on
            # every Branch listing every profile name in a text field) and
            # crashed the whole submission whenever it found nothing.
            pos_profile = frappe.get_cached_doc("POS Profile", doc.pos_profile)
            branch_name = pos_profile.custom_branch
            if branch_name:
                branch = frappe.get_doc("Branch", branch_name)
                doc.custom_branch = branch.name
                
                qr_generator = frappe.db.get_value(
                    "QR Generator",
                    {"branch": ["like", f"%{branch.name}%"]},
                    "name"
                )
                if qr_generator:
                    doc.custom_feedback_qr = qr_generator

                if branch.enable_fbr == 1 and len(doc.payments) > 0:
                    fbr_pos_charges = branch.fbr_pos_charges
                    custom_fbr_expense_account = branch.custom_fbr_expense_account
                    fbr_charges_account = branch.fbr_charges_account
                    cost_center = doc.cost_center

                    # Create FBR Charges Credit GL Entry
                    doc.append('taxes', {
                        'charge_type': 'Actual',
                        'account_head': fbr_charges_account,
                        'tax_amount': fbr_pos_charges,
                        'description': 'FBR Charges',
                        'cost_center': cost_center,
                        'auto_added_by_script': 1
                    })

                    # Check if any payment uses specific modes of payment
                    flag = 0
                    if not doc.payments:  
                        frappe.throw("No Mode of Payment Selected")
                    for p in doc.payments:
                        if p.amount != 0:  # Only consider non-zero payments
                            mop = frappe.get_doc("Mode of Payment", p.mode_of_payment)
                            if mop.name in ['HBL', 'Keenu']:
                                flag = 1
                                break  # Exit loop early if condition is met

                    if flag == 0:
                        # Create Expense Debit GL Entry
                        doc.append('taxes', {
                            'charge_type': 'Actual',
                            'account_head': custom_fbr_expense_account,
                            'tax_amount': -1 * abs(fbr_pos_charges),
                            'description': "FBR Expense",
                            'cost_center': cost_center,
                            'auto_added_by_script': 1
                        })

                    doc.calculate_taxes_and_totals()

                    if doc.paid_amount < doc.grand_total:
                        frappe.throw("Paid Amount cannot be less than the Grand Total after tax recalculation.")

                    if doc.paid_amount == doc.grand_total:
                        doc.change_amount = 0
                        doc.base_change_amount = 0

                    if doc.paid_amount > doc.grand_total:
                        doc.change_amount = doc.paid_amount - doc.grand_total
                        doc.base_change_amount = doc.paid_amount - doc.grand_total

    add_loyalty_point(doc)
    create_sales_order(doc)
    close_linked_sales_order(doc)
    update_coupon(doc, "used")


def before_cancel(doc, method):
    update_coupon(doc, "cancelled")


def close_linked_sales_order(doc):
    """If this invoice was checked out from a POS-created Sales Order (the KOT
    Print flow - see posapp.create_sales_order_from_pos), that Sales Order is
    still a draft so it could be edited up to now. Submit it and mark it
    Completed here, at final payment, so it drops off the open Sale Orders
    screen once it's been paid.
    """
    if not doc.get("sales_order"):
        return

    sales_order = frappe.get_doc("Sales Order", doc.sales_order)

    if sales_order.docstatus == 0:
        sales_order.flags.ignore_permissions = True
        sales_order.submit()

    if sales_order.docstatus == 1 and sales_order.status != "Completed":
        sales_order.db_set("status", "Completed", update_modified=False)


def add_loyalty_point(invoice_doc):
    for offer in invoice_doc.posa_offers:
        if offer.offer == "Loyalty Point":
            original_offer = frappe.get_doc("POS Offer", offer.offer_name)
            if original_offer.loyalty_points > 0:
                loyalty_program = frappe.get_value(
                    "Customer", invoice_doc.customer, "loyalty_program"
                )
                if not loyalty_program:
                    loyalty_program = original_offer.loyalty_program
                doc = frappe.get_doc(
                    {
                        "doctype": "Loyalty Point Entry",
                        "loyalty_program": loyalty_program,
                        "loyalty_program_tier": original_offer.name,
                        "customer": invoice_doc.customer,
                        "invoice_type": "Sales Invoice",
                        "invoice": invoice_doc.name,
                        "loyalty_points": original_offer.loyalty_points,
                        "expiry_date": add_days(invoice_doc.posting_date, 10000),
                        "posting_date": invoice_doc.posting_date,
                        "company": invoice_doc.company,
                    }
                )
                doc.insert(ignore_permissions=True)


def create_sales_order(doc):
    # Only one Sales Order is ever generated per invoice, and only while the
    # invoice can still change - once it's submitted or fully paid, that
    # window is closed for good. before_submit is the only caller today, but
    # this guards against it running twice for the same invoice too (e.g. a
    # background job retried after an earlier failure downstream, like the
    # close_linked_sales_order crash), which would otherwise create a second,
    # duplicate Sales Order the next time this invoice is (re)submitted.
    if doc.docstatus == 1:
        return
    if doc.paid_amount and doc.grand_total and flt(doc.paid_amount) >= flt(doc.grand_total):
        return
    if any(item.sales_order for item in doc.items):
        return

    if (
        doc.posa_pos_opening_shift
        and doc.pos_profile
        and doc.is_pos
        and doc.posa_delivery_date
        and not doc.update_stock
        and frappe.get_value("POS Profile", doc.pos_profile, "posa_allow_sales_order")
    ):
        sales_order_doc = make_sales_order(doc.name)
        if sales_order_doc:
            sales_order_doc.posa_notes = doc.posa_notes
            # get_mapped_doc's field-name copy can't be relied on here since
            # source_name is re-fetched from the DB and doc's business date
            # was only just set in-memory this same validate() pass - force it.
            sales_order_doc.custom_business_date = doc.custom_business_date
            sales_order_doc.flags.ignore_permissions = True
            sales_order_doc.flags.ignore_account_permission = True
            sales_order_doc.save()
            sales_order_doc.submit()
            url = frappe.utils.get_url_to_form(
                sales_order_doc.doctype, sales_order_doc.name
            )
            msgprint = "Sales Order Created at <a href='{0}'>{1}</a>".format(
                url, sales_order_doc.name
            )
            frappe.msgprint(
                _(msgprint), title="Sales Order Created", indicator="green", alert=True
            )
            i = 0
            for item in sales_order_doc.items:
                doc.items[i].sales_order = sales_order_doc.name
                doc.items[i].so_detail = item.name
                i += 1


def make_sales_order(source_name, target_doc=None, ignore_permissions=True):
    def set_missing_values(source, target):
        target.ignore_pricing_rule = 1
        target.flags.ignore_permissions = ignore_permissions
        target.run_method("set_missing_values")
        target.run_method("calculate_taxes_and_totals")

    def update_item(obj, target, source_parent):
        target.stock_qty = flt(obj.qty) * flt(obj.conversion_factor)
        target.delivery_date = (
            obj.posa_delivery_date or source_parent.posa_delivery_date
        )

    doclist = get_mapped_doc(
        "Sales Invoice",
        source_name,
        {
            "Sales Invoice": {
                "doctype": "Sales Order",
            },
            "Sales Invoice Item": {
                "doctype": "Sales Order Item",
                "field_map": {
                    "cost_center": "cost_center",
                    "Warehouse": "warehouse",
                    "delivery_date": "posa_delivery_date",
                    "posa_notes": "posa_notes",
                },
                "postprocess": update_item,
            },
            "Sales Taxes and Charges": {
                "doctype": "Sales Taxes and Charges",
                "add_if_empty": True,
            },
            "Sales Team": {"doctype": "Sales Team", "add_if_empty": True},
            "Payment Schedule": {"doctype": "Payment Schedule", "add_if_empty": True},
        },
        target_doc,
        set_missing_values,
        ignore_permissions=ignore_permissions,
    )

    return doclist


def update_coupon(doc, transaction_type):
    for coupon in doc.posa_coupons:
        if not coupon.applied:
            continue
        update_coupon_code_count(coupon.coupon, transaction_type)


def set_patient(doc):
    domain = get_company_domain(doc.company)
    if domain != "Healthcare":
        return
    patient_list = frappe.get_all(
        "Patient", filters={"customer": doc.customer}, page_length=1
    )
    if len(patient_list) > 0:
        doc.patient = patient_list[0].name


def auto_set_delivery_charges(doc):
    if not doc.pos_profile:
        return
    if not frappe.get_cached_value(
        "POS Profile", doc.pos_profile, "posa_auto_set_delivery_charges"
    ):
        return

    delivery_charges = get_applicable_delivery_charges(
        doc.company,
        doc.pos_profile,
        doc.customer,
        doc.shipping_address_name,
        doc.posa_delivery_charges,
        restrict=True,
    )

    if doc.posa_delivery_charges:
        if doc.posa_delivery_charges_rate:
            return
        else:
            if len(delivery_charges) > 0:
                doc.posa_delivery_charges_rate = delivery_charges[0].rate
    else:
        if len(delivery_charges) > 0:
            doc.posa_delivery_charges = delivery_charges[0].name
            doc.posa_delivery_charges_rate = delivery_charges[0].rate
        else:
            doc.posa_delivery_charges = None
            doc.posa_delivery_charges_rate = None


def calc_delivery_charges(doc):
    if not doc.pos_profile:
        return

    old_doc = None
    calculate_taxes_and_totals = False
    if not doc.is_new():
        old_doc = doc.get_doc_before_save()
        if not doc.posa_delivery_charges and not old_doc.posa_delivery_charges:
            return
    else:
        if not doc.posa_delivery_charges:
            return
    if not doc.posa_delivery_charges:
        doc.posa_delivery_charges_rate = 0

    charges_doc = None
    if doc.posa_delivery_charges:
        charges_doc = frappe.get_cached_doc(
            "Delivery Charges", doc.posa_delivery_charges
        )
        doc.posa_delivery_charges_rate = charges_doc.default_rate
        charges_profile = next(
            (i for i in charges_doc.profiles if i.pos_profile == doc.pos_profile), None
        )
        if charges_profile:
            doc.posa_delivery_charges_rate = charges_profile.rate

    if old_doc and old_doc.posa_delivery_charges:
        old_charges = next(
            (
                i
                for i in doc.taxes
                if i.charge_type == "Actual"
                and i.description == old_doc.posa_delivery_charges
            ),
            None,
        )
        if old_charges:
            doc.taxes.remove(old_charges)
            calculate_taxes_and_totals = True

    if doc.posa_delivery_charges:
        doc.append(
            "taxes",
            {
                "charge_type": "Actual",
                "description": doc.posa_delivery_charges,
                "tax_amount": doc.posa_delivery_charges_rate,
                "cost_center": charges_doc.cost_center,
                "account_head": charges_doc.shipping_account,
            },
        )
        calculate_taxes_and_totals = True

    if calculate_taxes_and_totals:
        doc.calculate_taxes_and_totals()


def validate_shift(doc):
    # Only back-fill from an item's own sales_order (the standard ERPNext
    # Sales Invoice Item link, set e.g. by create_sales_order() backfilling
    # doc.items[i].sales_order after invoicing generates a future delivery
    # order) as a fallback - never stomp doc.sales_order if it's already set,
    # since that's a different, unrelated link: the KOT-created draft Sales
    # Order this invoice was checked out from (see OrderSummary.vue's
    # get_invoice_doc and close_linked_sales_order below), which the client
    # sets directly and must not be overwritten by whichever item happens to
    # have its own sales_order populated.
    if not doc.get("sales_order"):
        for item in doc.items:
            if item.sales_order:
                doc.sales_order = item.sales_order
                break
            
    # Fetch current user if posa_pos_opening_shift is empty
    if doc.get("is_pos"):
        if not doc.get("posa_pos_opening_shift"):
            
            # Get the current user (assuming frappe.session.user gives the current logged-in user)
            user = frappe.session.user
            
            # Fetch open POS Opening Shifts for the current user
            open_vouchers = frappe.db.get_all(
                "POS Opening Shift",
                filters={
                    "user": user,
                    "pos_closing_shift": ["in", ["", None]],  # Filter where pos_closing_shift is empty or None
                    "docstatus": 1,
                    "status": "Open",
                },
                fields=["name", "pos_profile"],
                order_by="period_start_date desc",
            )
            
            # If open vouchers exist, update posa_pos_opening_shift with the name of the first found voucher
            if open_vouchers:
                doc.posa_pos_opening_shift = open_vouchers[0]["name"]
                doc.pos_profile = open_vouchers[0]["pos_profile"]        
            # Ensure posa_pos_opening_shift is not empty
            if not doc.get("posa_pos_opening_shift"):
                frappe.throw(_("No open POS Opening Shift found for user {0}").format(user))

    # Validate the POS opening shift if it exists
    if doc.posa_pos_opening_shift and doc.pos_profile and doc.is_pos:
        # check if shift is open
        shift = frappe.get_cached_doc("POS Opening Shift", doc.posa_pos_opening_shift)
        if shift.status != "Open":
            frappe.throw(_("POS Shift {0} is not open").format(shift.name))
        # check if shift is for the same profile
        if shift.pos_profile != doc.pos_profile:
            frappe.throw(
                _("POS Opening Shift {0} is not for the same POS Profile").format(
                    shift.name
                )
            )
        # check if shift is for the same company
        if shift.company != doc.company:
            frappe.throw(
                _("POS Opening Shift {0} is not for the same company").format(
                    shift.name
                )
            )
