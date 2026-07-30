import frappe

no_cache = 1


def get_context():
	frappe.db.commit()
	context = frappe._dict()
	context.boot = {
		"frappe_version": frappe.__version__,
		"csrf_token": frappe.sessions.get_csrf_token(),
	}
	return context
