<template>
	<div class="flex min-h-screen flex-col bg-gray-50">
		<header
			class="flex items-center justify-between border-b bg-white px-4 py-3"
			style="padding-top: max(0.75rem, env(safe-area-inset-top))"
		>
			<div class="flex items-center gap-2">
				<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
					S
				</div>
				<h1 class="text-base font-semibold text-gray-900">Site Ops</h1>
			</div>
			<div class="flex items-center gap-3">
				<div class="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
					{{ initials }}
				</div>
				<button
					type="button"
					class="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:bg-gray-200"
					title="Log out"
					@click="logout"
				>
					<Icon name="logout" class="h-4.5 w-4.5" />
				</button>
			</div>
		</header>

		<main class="flex-1 overflow-y-auto pb-24">
			<router-view />
		</main>

		<nav
			class="fixed inset-x-0 bottom-0 flex border-t bg-white/95 backdrop-blur"
			style="padding-bottom: env(safe-area-inset-bottom)"
		>
			<router-link
				v-for="tab in tabs"
				:key="tab.to"
				:to="tab.to"
				class="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition-colors"
				:class="isActive(tab.match) ? 'text-indigo-600' : 'text-gray-400'"
			>
				<span
					class="flex h-8 w-10 items-center justify-center rounded-full transition-colors"
					:class="isActive(tab.match) ? 'bg-indigo-50' : ''"
				>
					<Icon :name="tab.icon" class="h-5 w-5" />
				</span>
				<span :class="isActive(tab.match) ? 'font-medium' : ''">{{ tab.label }}</span>
			</router-link>
		</nav>

		<AppToasts />
	</div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { call } from 'frappe-ui'
import Icon from './components/Icon.vue'
import AppToasts from './components/AppToasts.vue'
import { useSessionStore } from './stores/session'

const session = useSessionStore()
onMounted(() => session.fetch())

const initials = computed(() => {
	const user = session.user
	if (!user || user === 'Guest') return '?'
	return user
		.split(/[\s@.]+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((p) => p[0].toUpperCase())
		.join('')
})

async function logout() {
	await call('logout')
	window.location.href = '/login'
}

const route = useRoute()
const tabs = [
	{ label: 'Requests', to: '/material-requests', match: '/material-requests', icon: 'clipboard-list' },
	{ label: 'Receive', to: '/purchase-orders', match: '/purchase-', icon: 'truck' },
	{ label: 'Items', to: '/items', match: '/items', icon: 'cube' },
]
function isActive(match) {
	return route.path.startsWith(match)
}
</script>
