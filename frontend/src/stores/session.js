import { defineStore } from 'pinia'
import { call } from 'frappe-ui'
import { getMyDefaults } from '../utils/frappeApi'

export const useSessionStore = defineStore('session', {
	state: () => ({
		user: null,
		roles: [],
		defaults: {},
		loading: false,
		error: null,
	}),
	getters: {
		isSiteManager: (state) => state.roles.includes('SRC Site Manager'),
	},
	actions: {
		async fetch() {
			this.loading = true
			this.error = null
			try {
				this.user = await call('frappe.auth.get_logged_user')
				this.defaults = await getMyDefaults().catch(() => ({}))
				this.roles = this.defaults.roles || []
			} catch (e) {
				this.error = e
			} finally {
				this.loading = false
			}
		},
	},
})
