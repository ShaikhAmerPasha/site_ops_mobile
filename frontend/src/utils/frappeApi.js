import { call } from 'frappe-ui'

export function getList(doctype, opts = {}) {
	return call('frappe.client.get_list', { doctype, ...opts })
}

export function getCount(doctype, filters = {}) {
	return call('frappe.client.get_count', { doctype, filters })
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

export function saveDoc(doc) {
	return call('frappe.client.save', { doc })
}

export function applyWorkflowAction(doctype, name, action) {
	return call('frappe.model.workflow.apply_workflow', { doc: { doctype, name }, action })
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

// Frappe error responses carry the readable text nested inside
// _server_messages: a JSON-stringified array of JSON-stringified {message}
// objects. Passing that raw into an Error() shows unreadable escaped JSON in
// the toast, easy to mistake for noise and dismiss without realizing it was
// the actual failure reason.
function extractServerMessage(data) {
	if (!data?._server_messages) return data?.message
	try {
		const messages = JSON.parse(data._server_messages)
		const first = JSON.parse(messages[0])
		return first.message || data.message
	} catch (e) {
		return data.message
	}
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
		throw new Error(extractServerMessage(data) || 'Upload failed')
	}
	return data.message
}
