# -*- coding: utf-8 -*-
# For license information, please see license.txt

from __future__ import unicode_literals
from frappe.model.document import Document


class POSBillCounter(Document):
	"""One row per (branch, business_date), tracking the last Bill No handed
	out for that branch's trading day. Never created/updated through this
	controller directly - see posapp.get_next_bill_no() for the atomic
	increment this doctype exists to support."""

	pass
