// For license information, please see license.txt

frappe.ui.form.on('POS Profile', {
    setup: function (frm) {
        frm.set_query("posa_cash_mode_of_payment", function (doc) {
            return {
                filters: { 'type': 'Cash' }
            };
        });
        frm.set_query("print_format", function() {
			return {
				filters: [
					['Print Format', 'doc_type', '=', 'Sales Invoice']
				]
			};
		});
        frm.set_query("kot_print_format", function() {
			return {
				filters: [
					['Print Format', 'doc_type', '=', 'Sales Invoice']
				]
			};
		});
        frm.set_query("pre_invoice_pirnt_format", function() {
			return {
				filters: [
					['Print Format', 'doc_type', '=', 'Sales Invoice']
				]
			};
		});
    },
});