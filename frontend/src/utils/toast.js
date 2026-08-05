import { reactive } from 'vue'

export const toasts = reactive([])

let idCounter = 0

function stripHtml(message) {
	if (typeof message !== 'string') return message
	return message.replace(/<[^>]*>/g, '').trim()
}

function push(message, type) {
	const id = ++idCounter
	toasts.push({ id, message: stripHtml(message), type })
	// Errors stay up longer — a 4s auto-dismiss is easy to miss on a
	// critical failure (e.g. "receipt submitted but photo failed to attach"),
	// leaving the user thinking nothing went wrong at all.
	setTimeout(() => {
		const idx = toasts.findIndex((t) => t.id === id)
		if (idx !== -1) toasts.splice(idx, 1)
	}, type === 'error' ? 8000 : 4000)
}

export const toast = {
	success: (message) => push(message, 'success'),
	error: (message) => push(message, 'error'),
}
