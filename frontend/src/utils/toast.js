import { reactive } from 'vue'

export const toasts = reactive([])

let idCounter = 0

function push(message, type) {
	const id = ++idCounter
	toasts.push({ id, message, type })
	setTimeout(() => {
		const idx = toasts.findIndex((t) => t.id === id)
		if (idx !== -1) toasts.splice(idx, 1)
	}, 4000)
}

export const toast = {
	success: (message) => push(message, 'success'),
	error: (message) => push(message, 'error'),
}
