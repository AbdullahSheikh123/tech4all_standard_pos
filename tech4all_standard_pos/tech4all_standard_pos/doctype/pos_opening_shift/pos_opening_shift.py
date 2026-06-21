# -*- coding: utf-8 -*-
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.utils import cint
from frappe.model.document import Document
from tech4all_standard_pos.tech4all_standard_pos.api.status_updater import StatusUpdater


class POSOpeningShift(StatusUpdater):
    def validate(self):
        self.validate_pos_profile_and_cashier()
        self.set_status()

        # code by asif...............................................................................
        check_open_shift = frappe.get_all("POS Opening Shift", filters={"status":"Open", "pos_profile":self.pos_profile, "docstatus":1}, fields=["*"])
        if check_open_shift:
            return frappe.throw(_("POS Opening Shift is alredy opened for this POS Profile: <b>{}</b>").format(self.pos_profile))
            
        # else:
        #     return frappe.throw(_("koi b open nhi hai"))
        


    def validate_pos_profile_and_cashier(self):
        if self.company != frappe.db.get_value("POS Profile", self.pos_profile, "company"):
            frappe.throw(_("POS Profile {} does not belongs to company {}".format(self.pos_profile, self.company)))

        if not cint(frappe.db.get_value("User", self.user, "enabled")):
            frappe.throw(_("User {} has been disabled. Please select valid user/cashier".format(self.user)))

    def on_submit(self):
        self.set_status(update=True)


        # # code by asif...............................................................................
        # check_open_shift = frappe.get_all("POS Opening Shift", filters={"status":"Open", "docstatus":1}, fields=["*"])
        # if check_open_shift:
        #     print(check_open_shift[0].name)
        #     print(check_open_shift[0].pos_profile)
        #     return frappe.throw(_("POS Opening Shift is alredy opened for this POS Profile xyz"))
            
        # # else:
        # #     return frappe.throw(_("koi b open nhi hai"))


@frappe.whitelist()
def check_opening_cash(pos_opening_entry):
    poe = frappe.get_doc("POS Opening Shift", pos_opening_entry)
    if poe.status == "Closed":
        frappe.throw(_("Only Allowed for Open Entries."))

    for d in poe.balance_details:
        if d.mode_of_payment and frappe.db.get_value("Mode of Payment", d.mode_of_payment, "type") == "Cash" and d.amount > 0 and "System Manager" not in frappe.get_roles():
            frappe.throw(_("Opening Already Entered."))


@frappe.whitelist()
def add_opening_cash(pos_opening_entry, opening_cash):
    check_opening_cash(pos_opening_entry)
    poe = frappe.get_doc("POS Opening Shift", pos_opening_entry)
    cash_row = None
    for d in poe.balance_details:
        if d.mode_of_payment and frappe.db.get_value("Mode of Payment", d.mode_of_payment, "type") == "Cash":
            d.amount = opening_cash
            cash_row = d

    if not cash_row:
        frappe.throw(_("No Mode of Payment Cash in Opening Entry"))

    poe.save()


@frappe.whitelist()
def change_status_to_open(pos_opening_entry):
    # Get the POS Opening Shift document
    pos_opening_shift = frappe.get_doc("POS Opening Shift", pos_opening_entry)
    
    # Check if the status is already 'Closed'
    if pos_opening_shift.status == "Closed":
        # Check if this POS Opening Shift is referenced in any submitted POS Closing Shift
        closing_shifts = frappe.get_all(
            "POS Closing Shift",
            filters={
                "pos_opening_shift": pos_opening_entry,
                "docstatus": 1  # Submitted documents
            },
            fields=["name"]
        )
        
        # If there are submitted closing shifts, throw an error
        if closing_shifts:
            frappe.throw(
                _("Cannot change the status to 'Open' because a submitted POS Closing Shift exists against this POS Opening Shift.")
            )
        
        # Otherwise, update the status and save
        pos_opening_shift.status = "Open"
        pos_opening_shift.save()
        frappe.db.commit()

