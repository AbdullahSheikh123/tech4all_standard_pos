# License: GNU General Public License v3. See license.txt


import json
from collections import defaultdict

import frappe
from frappe import scrub
from frappe.desk.reportview import get_filters_cond, get_match_cond
from frappe.utils import nowdate, unique

import erpnext
from erpnext.stock.get_item_details import _get_item_tax_template
from erpnext.controllers.queries import get_fields



@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def branch_warehouses(doctype, txt, searchfield, start, page_len, filters):
	doctype = "Warehouse"
	conditions = []
	fields = get_fields(doctype, ["name"])

	warehouses = []
	branch = frappe.get_doc("Branch", filters["branch"])

	warehouses = [d.warehouse for d in branch.warehouses]
	if branch.rejected_warehouse:
		warehouses.append(branch.rejected_warehouse)

	conditions = ""
	if warehouses:
		w = "','".join(warehouses)
		conditions += "and name in ('{0}')".format(w)

	del filters["branch"]

	return frappe.db.sql(
		"""select {fields} from `tabWarehouse`
		where docstatus < 2
			{conditions}
			and ({key} like %(txt)s
				or name like %(txt)s)
			{fcond} {mcond} 
		order by
			(case when locate(%(_txt)s, name) > 0 then locate(%(_txt)s, name) else 99999 end),
			idx desc,
			name
		limit %(page_len)s offset %(start)s""".format(
			**{
				"fields": ", ".join(fields),
				"key": searchfield,
				"fcond": get_filters_cond(doctype, filters, conditions),
				"mcond": get_match_cond(doctype),
				"conditions": conditions
			}
		),
		{"txt": "%%%s%%" % txt, "_txt": txt.replace("%", ""), "start": start, "page_len": page_len},
	)


@frappe.whitelist()
def get_pos_submit_report_items(company, pos_profile, from_date, to_date, amount):
	# print(company, pos_profile, date, amount)
	#
	return frappe.db.sql(
		"""
		 SELECT *
		FROM (
			select *,
			 	sum(grand_total) over(order by name) running_total
			from `tabPOS Invoice`
				where
				 docstatus = 1
				 and company = %(company)s
				 and pos_profile = %(pos_profile)s
				 and CONCAT(`posting_date`, ' ', `posting_time`) >= %(from_date)s
				 and CONCAT(`posting_date`, ' ', `posting_time`) <= %(to_date)s
				 and (fbr_invoice_id is null or fbr_invoice_id = '')
			order by name
		 ) as invoice
		 WHERE invoice.running_total <= %(amount)s;
        """,
		{"company": company, "pos_profile": pos_profile, "from_date": from_date, "to_date": to_date, "amount": amount},
		as_dict=True
	)