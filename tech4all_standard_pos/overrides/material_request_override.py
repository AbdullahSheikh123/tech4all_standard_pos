# License: GNU General Public License v3. See license.txt

# Tech4All ERP - web based ERP (http://Tech4All.com)
# For license information, please see license.txt


import json

import frappe
from frappe import _, msgprint
from frappe.utils import getdate
from erpnext.stock.doctype.material_request.material_request import MaterialRequest, make_stock_entry

from erpnext.stock.doctype.stock_entry.stock_entry import make_stock_in_entry

from erpnext.stock.get_item_details import get_basic_details, get_price_list_rate, get_item_price, get_bin_details

form_grid_templates = {"items": "templates/form_grid/material_request_grid.html"}
from erpnext.stock.utils import get_stock_balance, get_stock_value_on

class MaterialRequestOverride(MaterialRequest):
	def validate(self):
		super(MaterialRequest, self).validate()
		self.validate_items()


	def validate_items(self):
		self.total_amount = 0
		self.total_qty = 0
		
		item_code_map = {}

		if self.branch_requisition_template:
			brt = frappe.get_doc("Branch Requisition Template", self.branch_requisition_template)

			for d in brt.items:
				item_code_map[d.item_code] = d

		if self.branch:
			branch = frappe.get_doc("Branch", self.branch)
			self.cost_center = branch.cost_center

		items = []
		for d in self.items:
			if not d.item_code in items:
				items.append(d.item_code)
			else:
				frappe.throw(_("Duplicate Item Code: <b>{0}</b>:<b>{1}</b> in row: <b>{2}</b>".format(d.item_code, d.item_name, d.idx)))

			if self.branch:
				d.cost_center = branch.cost_center

			if self.branch_requisition_template and self.branch:
				d.from_warehouse = item_code_map[d.item_code].from_warehouse
				d.warehouse = self.set_warehouse

			if not d.selling_rate:
				d.selling_rate = 0

			d.selling_amount = d.qty * d.selling_rate
			self.total_amount += d.selling_amount
			self.total_qty += d.qty

	@frappe.whitelist()
	def get_branch_details(self):
		if not self.branch:
			return
		branch = frappe.get_doc("Branch", self.branch)
		self.cost_center = branch.cost_center
		self.price_list = frappe.db.get_value("POS Profile", branch.pos_profile, "selling_price_list")
		if branch.default_source_warehouse:
			self.set_from_warehouse = branch.default_source_warehouse

		if branch.default_target_warehouse:
			self.set_warehouse = branch.default_target_warehouse

		self.material_request_type = "Material Transfer"
		self.transaction_date = getdate()
		self.schedule_date = getdate()
		self.set_requisition_type()

		if self.branch_requisition_template:
			self.load_branch_requisition_template()

	def get_branch_requisition_template(self, branch):
		for d in branch.branch_requisition_type_mapping:
			if d.requisition_type == self.requisition_type:
				self.branch_requisition_template = d.branch_requisition_template
				break

	def set_requisition_type(self):
		if not self.requisition_type:
			self.requisition_type = "Finished"
		if not self.branch_requisition_template:
			branch = frappe.get_doc("Branch", self.branch)
			self.get_branch_requisition_template(branch)

	@frappe.whitelist()
	def load_branch_requisition_template(self):
		self.set_requisition_type()
		if not self.branch_requisition_template:
			return

		branch = frappe.get_doc("Branch", self.branch)
		self.cost_center = branch.cost_center
		self.price_list = frappe.db.get_value("POS Profile", branch.pos_profile, "selling_price_list")

		branch_requisition_template = frappe.get_doc("Branch Requisition Template", self.branch_requisition_template)
		if branch_requisition_template.get("material_request_type"):
			self.custom_material_request_purpose_type = branch_requisition_template.get("material_request_type")
			self.material_request_type = frappe.db.get_value("Material Request Type", branch_requisition_template.get("material_request_type"), "purpose")

		self.requisition_type = branch_requisition_template.requisition_type
		self.items = []
		for d in branch_requisition_template.items:
			row = self.append("items", {})
			row.item_code = d.item_code
			row.item_name = d.item_name
			row.item_group = d.item_group
			row.uom = d.uom
			row.qty = d.qty
			row.from_warehouse = d.from_warehouse
			row.warehouse = d.warehouse
			if self.set_from_warehouse and not row.from_warehouse:
				row.from_warehouse = self.set_from_warehouse

			if self.set_warehouse and not row.warehouse:
				row.warehouse = self.set_warehouse

			args = frappe._dict({"item_code": row.item_code, "doctype": self.doctype, "warehouse": row.warehouse, "price_list": self.price_list})
			data = get_basic_details(args, None, False)
			row.update(data)
			row.cost_center = self.cost_center
			row.qty = d.qty
			data = get_branch_stock_and_rate(row.item_code, branch.name)
			row.selling_rate = data.rate
			row.stock_at_branch = data.stock_at_branch

@frappe.whitelist()
def get_branch_stock_and_rate(item_code, branch):
	if not branch:
		return frappe._dict({"rate": 0, "stock_at_branch": 0})

	branch = frappe.get_doc("Branch", branch)
	cost_center = branch.cost_center
	warehouse = frappe.db.get_value("POS Profile", branch.pos_profile, "warehouse")
	item = frappe.get_doc("Item", item_code)
	price_list = frappe.db.get_value("POS Profile", branch.pos_profile, "selling_price_list")
	args = frappe._dict({"item_code": item_code, "doctype": "Material Request", "warehouse": warehouse, "price_list": price_list, "uom": item.sales_uom if item.sales_uom else item.stock_uom})
	
	rate = get_item_price(args, item_code)
	stock = get_stock_balance(item_code, warehouse)

	return frappe._dict({"rate": rate[0][1] if rate else 0, "stock_at_branch": stock})


@frappe.whitelist()
def make_in_transit_stock_entry(source_name, in_transit_warehouse=None):
	ste_doc = make_stock_entry(source_name)
	ste_doc.add_to_transit = 1
	ste_doc.to_warehouse = in_transit_warehouse

	mr = frappe.get_doc("Material Request", source_name)
	if mr.branch:
		ste_doc.material_request = mr.name
		ste_doc.branch = mr.branch

	for row in ste_doc.items:
		row.t_warehouse = in_transit_warehouse

	return ste_doc

@frappe.whitelist()
def receive_in_transit_stock_entry(source_name):

	mr = frappe.get_doc("Material Request", source_name)
	sources = frappe.get_all("Stock Entry", {"docstatus": 1, "material_request": mr.name, "add_to_transit": 1})

	ste_doc = make_stock_in_entry(sources[0].name)
	
	if mr.branch:
		ste_doc.material_request = mr.name
		ste_doc.branch = mr.branch

	return ste_doc


@frappe.whitelist()
def receive_purchase_order(source_name):
	from erpnext.buying.doctype.purchase_order.purchase_order import make_purchase_receipt
	mr = frappe.get_doc("Material Request", source_name)
	po = frappe.get_all("Purchase Order Item", filters={"docstatus": 1, "material_request": source_name}, fields=["parent"])
	if not po:
		frappe.throw(_("No Purchase Order Found"))
	pr = make_purchase_receipt(po[0].parent)

	return pr