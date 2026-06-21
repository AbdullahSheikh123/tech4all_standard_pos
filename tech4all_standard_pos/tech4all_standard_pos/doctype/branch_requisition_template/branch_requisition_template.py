# For license information, please see license.txt

import frappe
import copy
from frappe import _
from operator import itemgetter
from frappe.model.document import Document

class BranchRequisitionTemplate(Document):
	def validate(self):
		self.validate_items()
		self.sort_items()

	def validate_items(self):
		items = []
		for d in self.items:
			if not d.item_code in items:
				items.append(d.item_code)
			else:
				frappe.throw(_("Duplicate Item Code: <b>{0}</b>:<b>{1}</b> in row: <b>{2}</b>".format(d.item_code, d.item_name, d.idx)))

	def sort_items(self):
		if not self.items:
			return
		items = []
		for d in self.items:
			items.append({"item_code": d.item_code, "item_name": d.item_name, "item_group": d.item_group, "qty": d.qty, "from_warehouse": d.from_warehouse, "warehouse": d.warehouse})

		self.items = []
		items = sorted(items, key=lambda d: d['item_group']) 
		for d in items:
			self.append("items", d)