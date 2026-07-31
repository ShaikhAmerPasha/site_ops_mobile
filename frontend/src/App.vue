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
				<h1 class="text-base font-semibold text-gray-900">Site Procure</h1>
			</div>
			<div ref="menuRoot" class="relative">
				<button
					type="button"
					class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600 hover:ring-2 hover:ring-gray-300"
					@click="menuOpen = !menuOpen"
				>
					{{ initials }}
				</button>

				<div
					v-if="menuOpen"
					class="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
				>
					<div class="border-b px-3.5 py-2.5">
						<p class="truncate text-sm font-medium text-gray-900">{{ session.user }}</p>
					</div>
					<a
						href="/app"
						class="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
					>
						<Icon name="desktop" class="h-4 w-4 text-gray-400" />
						Switch to Desk
					</a>
					<button
						type="button"
						class="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
						@click="logout"
					>
						<Icon name="logout" class="h-4 w-4 text-gray-400" />
						Log out
					</button>
				</div>
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
				:to="lastPath[tab.key]"
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
import { computed, onMounted, onUnmounted, ref, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import { call } from 'frappe-ui'
import Icon from './components/Icon.vue'
import AppToasts from './components/AppToasts.vue'
import { useSessionStore } from './stores/session'

const session = useSessionStore()
onMounted(() => session.fetch())

const menuOpen = ref(false)
const menuRoot = ref(null)

function onDocumentClick(e) {
	if (menuOpen.value && menuRoot.value && !menuRoot.value.contains(e.target)) {
		menuOpen.value = false
	}
}
onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))

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
	{ key: 'requests', label: 'Requests', to: '/material-requests', match: '/material-requests', icon: 'clipboard-list' },
	{ key: 'receive', label: 'Receive', to: '/purchase-orders', match: '/purchase-', icon: 'truck' },
	{ key: 'items', label: 'Items', to: '/items', match: '/items', icon: 'cube' },
]
function isActive(match) {
	return route.path.startsWith(match)
}

// Each tab remembers the last page you were on within it (e.g. the New
// Material Request form, not just the list) so switching tabs and coming
// back doesn't strand an in-progress form behind the list view.
const lastPath = reactive(Object.fromEntries(tabs.map((t) => [t.key, t.to])))
watch(
	() => route.fullPath,
	(fullPath) => {
		const tab = tabs.find((t) => route.path.startsWith(t.match))
		if (tab) lastPath[tab.key] = fullPath
	},
	{ immediate: true },
)
</script>
