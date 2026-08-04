<template>
	<div class="p-4">
		<PageHeader title="Labour Payments" />

		<LoadingSpinner v-if="loading" />
		<EmptyState
			v-else-if="!entries.length"
			icon="users"
			title="No labour payment entries"
			subtitle="Entries you can access will show up here"
		/>

		<div v-else class="space-y-2">
			<router-link
				v-for="lpe in entries"
				:key="lpe.name"
				:to="`/labour-payments/${lpe.name}`"
				class="block rounded-lg border border-gray-200 bg-white p-3.5 transition-colors active:bg-gray-50"
			>
				<div class="flex items-center justify-between gap-2">
					<span class="font-medium text-gray-900">{{ lpe.name }}</span>
					<StatusBadge v-if="lpe.workflow_state" :status="lpe.workflow_state" />
				</div>
				<p class="mt-1 text-xs text-gray-400">{{ lpe.contractor }}</p>
			</router-link>
		</div>

		<!-- Temporary debug panel — remove once the Draft-visibility issue is
		confirmed fixed on production. Screenshot this and send it back. -->
		<div class="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 text-xs text-gray-600">
			<p class="mb-1 font-semibold text-gray-700">Debug info</p>
			<p>User: {{ session.user || '(not loaded)' }}</p>
			<p>Roles: {{ session.roles.length ? session.roles.join(', ') : '(none loaded)' }}</p>
			<p>Entries returned: {{ entries.length }}</p>
			<p v-if="fetchError" class="mt-1 text-red-600">Error: {{ fetchError }}</p>
			<template v-if="firstDocFields">
				<p class="mt-2 font-semibold text-gray-700">Fields on {{ entries[0]?.name }} containing "state"/"status":</p>
				<p v-if="!firstDocFields.length">none found — the state field is named something else entirely</p>
				<p v-for="f in firstDocFields" :key="f.key">{{ f.key }} = {{ f.value }}</p>
			</template>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getList, getDoc } from '../utils/frappeApi'
import { toast } from '../utils/toast'
import { useSessionStore } from '../stores/session'
import PageHeader from '../components/PageHeader.vue'
import StatusBadge from '../components/StatusBadge.vue'
import EmptyState from '../components/EmptyState.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const session = useSessionStore()
const entries = ref([])
const loading = ref(true)
const fetchError = ref('')
const firstDocFields = ref(null)

onMounted(async () => {
	if (!session.user) await session.fetch().catch(() => {})
	try {
		// No state filter here on purpose — show whatever this user's own
		// doctype permissions let through, same set Desk shows them. We don't
		// rely on the workflow_state field name/value matching our guess.
		entries.value = await getList('Labour Payment Entry', {
			fields: ['name', 'contractor', 'workflow_state'],
			order_by: 'modified desc',
			limit_page_length: 50,
		})

		if (entries.value.length) {
			const full = await getDoc('Labour Payment Entry', entries.value[0].name).catch(() => null)
			if (full) {
				firstDocFields.value = Object.keys(full)
					.filter((k) => /state|status/i.test(k))
					.map((k) => ({ key: k, value: full[k] }))
			}
		}
	} catch (e) {
		fetchError.value = e.messages?.[0] || e.message || JSON.stringify(e)
		toast.error(fetchError.value || 'Failed to load labour payment entries')
	} finally {
		loading.value = false
	}
})
</script>
