# License: GNU General Public License v3. See license.txt


import json

import frappe
from frappe import _, throw
from erpnext.stock.get_item_details import get_item_details, process_args

@frappe.whitelist()
def get_item_details_custom(args, doc=None, for_validate=False, overwrite_warehouse=True):
	result = get_item_details(args, doc=doc, for_validate=for_validate, overwrite_warehouse=overwrite_warehouse)
	args = process_args(args)
	if args.doctype == "Material Request" and args.qty == 0:
		result.qty = 0
	return result