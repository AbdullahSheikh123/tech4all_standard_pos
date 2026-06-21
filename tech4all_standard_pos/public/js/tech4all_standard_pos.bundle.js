import './toConsole';
import './posapp/posapp';

frappe.form.link_formatters['Item'] = function (value, doc) {
    if (doc && value && doc.item_name && doc.item_name !== value && doc.item_code === value) {
        return value
    } else if (!value && doc.doctype && doc.item_name) {
        return doc.item_code;
    } else {
        return value;
    }
}