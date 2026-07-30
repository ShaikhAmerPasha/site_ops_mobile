<template>
	<div class="p-4">
		<PageHeader title="Purchase Receipts" back="/purchase-orders" />

		<LoadingSpinner v-if="loading" />
		<EmptyState v-else-if="!items.length" icon="inbox" title="No purchase receipts yet" />

		<div v-else class="space-y-2">
			<router-link
				v-for="pr in items"
				:key="pr.name"
				:to="`/purchase-receipts/${pr.name}`"
				class="block rounded-lg border border-gray-200 bg-white p-3.5 transition-colors active:bg-gray-50"
			>
				<div class="flex items-center justify-between gap-2">
					<span class="font-medium text-gray-900">{{ pr.name }}</span>
					<StatusBadge :status="pr.status" />
				</div>
				<p class="mt-1 text-xs text-gray-400">{{ pr.supplier }} · {{ pr.posting_date }}</p>
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

const items = ref([])
const loading = ref(true)

onMounted(async () => {
	try {
		items.value = await getList('Purchase Receipt', {
			fields: ['name', 'status', 'supplier', 'posting_date'],
			order_by: 'creation desc',
			limit_page_length: 50,
		})
	} catch (e) {
		toast.error(e.messages?.[0] || e.message || 'Failed to load purchase receipts')
	} finally {
		loading.value = false
	}
})
</script>
