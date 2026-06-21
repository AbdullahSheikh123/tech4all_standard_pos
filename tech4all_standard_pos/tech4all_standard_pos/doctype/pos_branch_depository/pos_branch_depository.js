// For license information, please see license.txt

frappe.ui.form.on('POS Branch Depository', {
	refresh: function(frm) {
		frm.trigger("set_posting_date_and_time");
	},
	set_posting_date_and_time: function(frm){
		if(frm.doc.docstatus == 0 && frm.doc.set_posting_date_and_time) {
			frm.set_df_property('posting_date', 'read_only', 0);
			frm.set_df_property('posting_time', 'read_only', 0);
		} else {
			frm.set_df_property('posting_date', 'read_only', 1);
			frm.set_df_property('posting_time', 'read_only', 1);
		}
	}
});
