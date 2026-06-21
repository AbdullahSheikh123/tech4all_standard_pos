# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document

class BranchDiscountPolicyEmployees(Document):
	def validate(self):
		self.validate_discount_percentage()

	def validate_discount_percentage(self):
		for d in self.employees:
			if d.max_discount > 100:
				frappe.throw(_("Max Discount cannot be greater then 100."))
