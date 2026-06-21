# License: MIT. See LICENSE

import frappe
from frappe import _
from pyqrcode import create as qrcreate
import io
import base64

def validate(self, method):
	if self.pos_profile:
		pos_profiles = frappe.get_all("Branch", filters={"pos_profile": self.pos_profile, "name": ["!=", self.name]})
		if pos_profiles:
			frappe.throw(_("POS Profile: <b>{0}</b> already used in Branch: <b>{1}</b>".format(self.pos_profile, pos_profiles[0].name)))

	if self.cost_center:
		cost_centers = frappe.get_all("Branch", filters={"cost_center": self.cost_center, "name": ["!=", self.name]})
		if cost_centers:
			frappe.throw(_("Cost Center: <b>{0}</b> already used in Branch: <b>{1}</b>".format(self.cost_center, cost_centers[0].name)))
	
	if self.rejected_warehouse:
		for d in self.warehouses:
			if d.warehouse == self.rejected_warehouse:
				frappe.throw(_("Rejected Warehouse: <b>{0}</b> must not be in Warehouses".format(self.rejected_warehouse)))

	warehouses = []
	for d in self.warehouses:
		if d.warehouse in warehouses:
			frappe.throw(_("Duplicate Warehouse: <b>{0}</b> at row: <b>{1}</b>".format(d.warehouse, d.idx)))

		warehouses.append(d.warehouse)


@frappe.whitelist()
def download_feedback_qr_code(branch):
	"""Download QR Code for feedback"""
	branch_object = frappe.get_doc("Branch", branch)

	if not branch_object:
		frappe.throw(_("Branch: <b>{0}</b> is not present".format(branch)))

	url = qrcreate(frappe.request.scheme + "://" + frappe.request.host + "/customer-feedback/new?branch=" + branch)
	stream = io.BytesIO()
	encoded = ""
	try:
		url.png(stream, scale=8)
		encoded = base64.b64encode(stream.getvalue()).decode()
	finally:
		stream.close()

	return encoded