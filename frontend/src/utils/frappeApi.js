import { call } from 'frappe-ui'

export function getList(doctype, opts = {}) {
	return call('frappe.client.get_list', { doctype, ...opts })
}

export function getDoc(doctype, name) {
	return call('frappe.client.get', { doctype, name })
}

export function insertDoc(doc) {
	return call('frappe.client.insert', { doc })
}

export function submitDoc(doc) {
	return call('frappe.client.submit', { doc })
}

export function getMyDefaults() {
	return call('site_ops_mobile.api.get_my_defaults')
}

export function makePurchaseReceipt(sourceName) {
	return call(
		'erpnext.buying.doctype.purchase_order.purchase_order.make_purchase_receipt',
		{ source_name: sourceName },
	)
}

export async function createAndSubmit(doc) {
	const inserted = await insertDoc(doc)
	return submitDoc(inserted)
}

export async function uploadFile(file, doctype, docname) {
	const formData = new FormData()
	formData.append('file', file)
	formData.append('doctype', doctype)
	formData.append('docname', docname)
	formData.append('is_private', '1')

	const headers = { 'X-Frappe-Site-Name': window.location.hostname }
	if (window.csrf_token && window.csrf_token !== '{{ csrf_token }}') {
		headers['X-Frappe-CSRF-Token'] = window.csrf_token
	}

	const res = await fetch('/api/method/upload_file', {
		method: 'POST',
		headers,
		body: formData,
	})
	const data = await res.json()
	if (!res.ok) {
		throw new Error(data._server_messages || data.message || 'Upload failed')
	}
	return data.message
}
