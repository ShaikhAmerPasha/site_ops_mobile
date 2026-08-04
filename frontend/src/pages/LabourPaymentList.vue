<template>
	<div class="p-4">
		<PageHeader title="Labour Payments" />

		<LoadingSpinner v-if="loading" />
		<EmptyState
			v-else-if="!entries.length"
			icon="users"
			title="No draft labour payment entries"
			subtitle="Entries waiting for you to fill in work items will show up here"
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
					<StatusBadge :status="lpe.workflow_state" />
				</div>
				<p class="mt-1 text-xs text-gray-400">{{ lpe.contractor }}</p>
			</router-link>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getList } from '../utils/frappeApi'
import { toast } from '../utils/toast'
import PageHeader from '../components/PageHeader.vue'
import StatusBadge from '../components/StatusBadge.vue'
import EmptyState from '../components/EmptyState.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const entries = ref([])
const loading = ref(true)

onMounted(async () => {
	try {
		// 'in' with '' also catches legacy/manually-created docs whose
		// workflow_state was never set (blank), not just the literal 'Draft'.
		entries.value = await getList('Labour Payment Entry', {
			filters: [['workflow_state', 'in', ['Draft', '']]],
			fields: ['name', 'contractor', 'workflow_state'],
			order_by: 'modified desc',
			limit_page_length: 50,
		})
	} catch (e) {
		toast.error(e.messages?.[0] || e.message || 'Failed to load labour payment entries')
	} finally {
		loading.value = false
	}
})
</script>
