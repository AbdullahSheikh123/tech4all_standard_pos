# License: MIT. See LICENSE

import frappe
from frappe import _
from frappe.utils import (
	cint,
	comma_or,
	cstr,
	flt,
	format_time,
	formatdate,
	getdate,
	month_diff,
	nowdate,
)

from erpnext.stock.doctype.stock_entry.stock_entry import StockEntry

def before_validate(self, method):
	StockEntry.validate_warehouse = validate_warehouse


def on_update(self, method):
	update_material_request_status(self)

def on_update_after_submit(self, method):
	update_material_request_status(self)

def update_material_request_status(self):
	if self.material_request and self.material_request_status and self.add_to_transit:
		frappe.db.set_value("Material Request", self.material_request, "workflow_state", self.material_request_status)

	if self.material_request and not self.add_to_transit and self.outgoing_stock_entry and self.docstatus == 1:
		frappe.db.set_value("Material Request", self.material_request, "workflow_state", "Received")


def validate_warehouse(self):
	if not self.docstatus == 1:
		return
	"""perform various (sometimes conditional) validations on warehouse"""

	source_mandatory = [
		"Material Issue",
		"Material Transfer",
		"Send to Subcontractor",
		"Material Transfer for Manufacture",
		"Material Consumption for Manufacture",
	]

	target_mandatory = [
		"Material Receipt",
		"Material Transfer",
		"Send to Subcontractor",
		"Material Transfer for Manufacture",
	]

	validate_for_manufacture = any([d.bom_no for d in self.get("items")])

	if self.purpose in source_mandatory and self.purpose not in target_mandatory:
		self.to_warehouse = None
		for d in self.get("items"):
			d.t_warehouse = None
	elif self.purpose in target_mandatory and self.purpose not in source_mandatory:
		self.from_warehouse = None
		for d in self.get("items"):
			d.s_warehouse = None

	for d in self.get("items"):
		if not d.s_warehouse and not d.t_warehouse:
			d.s_warehouse = self.from_warehouse
			d.t_warehouse = self.to_warehouse

		if self.purpose in source_mandatory and not d.s_warehouse:
			if self.from_warehouse:
				d.s_warehouse = self.from_warehouse
			else:
				frappe.throw(_("Source warehouse is mandatory for row {0}").format(d.idx))

		if self.purpose in target_mandatory and not d.t_warehouse:
			if self.to_warehouse:
				d.t_warehouse = self.to_warehouse
			else:
				frappe.throw(_("Target warehouse is mandatory for row {0}").format(d.idx))

		if self.purpose == "Manufacture":
			if validate_for_manufacture:
				if d.is_finished_item or d.is_scrap_item:
					d.s_warehouse = None
					if not d.t_warehouse:
						frappe.throw(_("Target warehouse is mandatory for row {0}").format(d.idx))
				else:
					d.t_warehouse = None
					if not d.s_warehouse:
						frappe.throw(_("Source warehouse is mandatory for row {0}").format(d.idx))

		if cstr(d.s_warehouse) == cstr(d.t_warehouse) and self.purpose not in [
			"Material Transfer for Manufacture",
			"Material Transfer",
		]:
			frappe.throw(_("Source and target warehouse cannot be same for row {0}").format(d.idx))

		if not (d.s_warehouse or d.t_warehouse):
			frappe.throw(_("Atleast one warehouse is mandatory"))