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
				const [user, defaults] = await Promise.all([
					call('frappe.auth.get_logged_user'),
					getMyDefaults().catch(() => ({})),
				])
				this.user = user
				this.defaults = defaults
				this.roles = defaults.roles || []
			} catch (e) {
				this.error = e
			} finally {
				this.loading = false
			}
		},
	},
})
