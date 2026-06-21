# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from erpnext.accounts.doctype.sales_invoice.sales_invoice import get_bank_cash_account

class POSBranchDepository(Document):
	def validate(self):
		self.set_mode_of_payment()

	def set_mode_of_payment(self):
		if not self.pos_profile:
			frappe.throw(_("POS Profile is mandatory."))
		pos_profile = frappe.get_doc("POS Profile", self.pos_profile)
		for d in pos_profile.payments:
			mop = frappe.get_doc("Mode of Payment", d.mode_of_payment)
			if mop.type == "Cash":
				self.mode_of_payment = mop.name
				break

	def on_submit(self):
		self.create_payment_entry()

	def create_payment_entry(self):
		if not self.mode_of_payment:
			frappe.throw(_("Mode of Payment is mandatory."))
		doc = frappe.new_doc("Payment Entry")
		doc.posting_date = self.posting_date
		doc.payment_type = "Internal Transfer"
		doc.mode_of_payment = self.mode_of_payment
		doc.company = self.company
		doc.paid_from = get_bank_cash_account(self.mode_of_payment, self.company)["account"]
		doc.paid_to = self.depository_account
		doc.paid_amount = self.amount
		doc.received_amount = self.amount
		doc.pos_branch_depository = self.name
		doc.cost_center = self.cost_center
		doc.set_missing_values()
		doc.set_exchange_rate()
		
		doc.save()
		doc.submit()
