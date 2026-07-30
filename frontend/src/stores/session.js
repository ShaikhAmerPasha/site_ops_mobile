import { defineStore } from 'pinia'
import { call } from 'frappe-ui'

export const useSessionStore = defineStore('session', {
	state: () => ({
		user: null,
		loading: false,
		error: null,
	}),
	actions: {
		async fetch() {
			this.loading = true
			this.error = null
			try {
				this.user = await call('frappe.auth.get_logged_user')
			} catch (e) {
				this.error = e
			} finally {
				this.loading = false
			}
		},
	},
})
