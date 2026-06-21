// For license information, please see license.txt

frappe.ui.form.on('POS Opening Shift', {
	setup(frm) {
		if (frm.doc.docstatus == 0) {
			frm.trigger('set_posting_date_read_only');
			frm.set_value('period_start_date', frappe.datetime.now_datetime());
			frm.set_value('user', frappe.session.user);
		}
		frm.set_query("user", function(doc) {
			return {
				query: "tech4all_standard_pos.tech4all_standard_pos.doctype.pos_closing_shift.pos_closing_shift.get_cashiers",
				filters: { 'parent': doc.pos_profile }
			};
		});
		frm.set_query("pos_profile", function(doc) {
			return {
				filters: { 'company': doc.company}
			};
		});
	},

	refresh(frm) {
		// set default posting date / time
		if(frm.doc.docstatus == 0) {
			if(!frm.doc.posting_date) {
				frm.set_value('posting_date', frappe.datetime.nowdate());
			}
			frm.trigger('set_posting_date_read_only');
		}
		
		// Add custom button to change status from Closed to Open
		if(frm.doc.status === "Closed") {
			frm.add_custom_button(__("Change Status to Open"), function() {
				frm.trigger("change_status_to_open");
			}).addClass("btn-primary");
		}

		if(frm.doc.docstatus == 1 && frm.doc.status != "Closed"){
			frm.add_custom_button(__("Add Opening Cash"), function(){
				frm.trigger("add_opening_cash");
			}).addClass("btn-primary");
		}

	},

	set_posting_date_read_only(frm) {
		if(frm.doc.docstatus == 0 && frm.doc.set_posting_date) {
			frm.set_df_property('posting_date', 'read_only', 0);
		} else {
			frm.set_df_property('posting_date', 'read_only', 1);
		}
	},

	set_posting_date(frm) {
		frm.trigger('set_posting_date_read_only');
	},

	add_opening_cash: function(frm){
		frm.call({
			"method": "tech4all_standard_pos.tech4all_standard_pos.doctype.pos_opening_shift.pos_opening_shift.check_opening_cash",
			"args": {
				"pos_opening_entry": frm.doc.name,
			},
			freeze: true,
			callback: function(r){
				if(!r.exec){
					var d = new frappe.ui.Dialog({
						title: "Add Opening Cash",
						fields: [
							{
								fieldtype: "Currency",
								label: __("Opening Cash"),
								fieldname: "opening_cash",
								reqd: 1
							},
						],
						primary_action: function () {
							return frm.call({
								args: {
									pos_opening_entry: frm.doc.name,
									opening_cash: d.get_value("opening_cash")
								},
								freeze: true,
								method: "tech4all_standard_pos.tech4all_standard_pos.doctype.pos_opening_shift.pos_opening_shift.add_opening_cash",
								callback: function (r) {
									if (r.exc) {
										frappe.msgprint(r.exc);
									} else {
										d.hide();
										frm.refresh_fields()
									}
								},
							});
						},
					});

					d.show();
				}
			}
		});
	},

	change_status_to_open: function(frm) {
		frm.call({
			"method": "tech4all_standard_pos.tech4all_standard_pos.doctype.pos_opening_shift.pos_opening_shift.change_status_to_open",
			"args": {
				"pos_opening_entry": frm.doc.name
			},
			freeze: true,
			callback: function(r) {
				if (r.exc) {
					frappe.msgprint(r.exc);
				} else {
					frm.set_value("status", "Open");
					frm.refresh_field("status");
				}
			}
		});
	},

	pos_profile: (frm) => {
		if (frm.doc.pos_profile) {
			frappe.db.get_doc("POS Profile", frm.doc.pos_profile)
				.then(({ payments }) => {
					if (payments.length) {
						frm.doc.balance_details = [];
						payments.forEach(({ mode_of_payment }) => {
							frm.add_child("balance_details", { mode_of_payment });
						})
						frm.refresh_field("balance_details");
					}
				});
		}
	}
});