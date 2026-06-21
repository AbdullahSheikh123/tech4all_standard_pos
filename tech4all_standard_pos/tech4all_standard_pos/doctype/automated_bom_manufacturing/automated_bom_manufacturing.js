// For license information, please see license.txt

frappe.ui.form.on('Automated BOM Manufacturing', {
	refresh: function(frm) {
		frm.set_query("item_code", function() {
			return {
				query: "erpnext.manufacturing.doctype.bom.bom.item_query",
				filters: {
					"is_stock_item": 1
				}
			};
		});

		frm.set_query("bom", function() {
			if (frm.doc.item_code) {
				return {
					query: "erpnext.controllers.queries.bom",
					filters: {item: cstr(frm.doc.item_code)}
				};
			} else {
				frappe.msgprint(__("Please enter Production Item first"));
			}
		});

		frm.set_query("cost_center", function() {
			return {
				filters: {
					"company": frm.doc.company,
					"is_group": 0
				}
			};
		});
	}
});	
