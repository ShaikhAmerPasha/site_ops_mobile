export function saveDraft(key, data) {
	try {
		localStorage.setItem(key, JSON.stringify(data))
	} catch (e) {
		// storage unavailable/full — losing the draft is better than crashing the form
	}
}

export function loadDraft(key) {
	try {
		const raw = localStorage.getItem(key)
		return raw ? JSON.parse(raw) : null
	} catch (e) {
		return null
	}
}

export function clearDraft(key) {
	try {
		localStorage.removeItem(key)
	} catch (e) {
		// ignore
	}
}
