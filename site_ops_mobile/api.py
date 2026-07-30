import frappe


@frappe.whitelist()
def get_my_defaults():
	return {
		"company": frappe.defaults.get_user_default("Company"),
		"warehouse": frappe.defaults.get_user_default("Warehouse"),
	}
