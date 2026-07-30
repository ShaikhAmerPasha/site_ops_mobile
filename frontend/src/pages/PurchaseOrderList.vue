<template>
	<div class="p-4">
		<PageHeader title="Receive Goods">
			<template #action>
				<router-link to="/purchase-receipts" class="text-sm font-medium text-indigo-600">
					History
				</router-link>
			</template>
		</PageHeader>

		<LoadingSpinner v-if="loading" />
		<EmptyState
			v-else-if="!orders.length"
			icon="truck"
			title="Nothing pending receipt"
			subtitle="Purchase Orders awaiting delivery will show up here"
		/>

		<div v-else class="space-y-2">
			<router-link
				v-for="po in orders"
				:key="po.name"
				:to="`/purchase-receipts/new/${po.name}`"
				class="block rounded-lg border border-gray-200 bg-white p-3.5 transition-colors active:bg-gray-50"
			>
				<div class="flex items-center justify-between gap-2">
					<span class="font-medium text-gray-900">{{ po.name }}</span>
					<span class="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
						{{ Math.round(po.per_received) }}% received
					</span>
				</div>
				<p class="mt-1 text-xs text-gray-400">{{ po.supplier }} · {{ po.transaction_date }}</p>
			</router-link>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getList } from '../utils/frappeApi'
import { toast } from '../utils/toast'
import PageHeader from '../components/PageHeader.vue'
import EmptyState from '../components/EmptyState.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const orders = ref([])
const loading = ref(true)

onMounted(async () => {
	try {
		orders.value = await getList('Purchase Order', {
			filters: [
				['docstatus', '=', 1],
				['per_received', '<', 100],
				['status', 'not in', ['Closed', 'Cancelled']],
			],
			fields: ['name', 'supplier', 'transaction_date', 'per_received'],
			order_by: 'transaction_date desc',
			limit_page_length: 50,
		})
	} catch (e) {
		toast.error(e.messages?.[0] || e.message || 'Failed to load purchase orders')
	} finally {
		loading.value = false
	}
})
</script>
