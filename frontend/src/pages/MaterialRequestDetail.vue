<template>
	<div class="p-4">
		<PageHeader title="Request" back="/material-requests" />

		<LoadingSpinner v-if="loading" />

		<div v-else-if="doc">
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-base font-semibold text-gray-900">{{ doc.name }}</h3>
				<StatusBadge :status="doc.status" />
			</div>
			<p class="mb-4 text-xs text-gray-400">{{ doc.transaction_date }} · {{ doc.company }}</p>

			<div class="space-y-2">
				<div v-for="row in doc.items" :key="row.name" class="rounded-lg border border-gray-200 bg-white p-3.5">
					<div class="flex items-center gap-2">
						<div class="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-50 text-indigo-500">
							<Icon name="cube" class="h-4 w-4" />
						</div>
						<div>
							<p class="text-sm font-medium text-gray-900">{{ row.item_code }}</p>
							<p class="text-xs text-gray-400">{{ row.item_name }}</p>
						</div>
					</div>
					<div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
						<span>Qty: <strong class="text-gray-700">{{ row.qty }} {{ row.uom }}</strong></span>
						<span>Warehouse: {{ row.warehouse }}</span>
					</div>
					<p v-if="row.description" class="mt-2 rounded bg-gray-50 px-2 py-1 text-xs italic text-gray-500">
						{{ row.description }}
					</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDoc } from '../utils/frappeApi'
import { toast } from '../utils/toast'
import PageHeader from '../components/PageHeader.vue'
import StatusBadge from '../components/StatusBadge.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import Icon from '../components/Icon.vue'

const props = defineProps({ name: String })

const doc = ref(null)
const loading = ref(true)

onMounted(async () => {
	try {
		doc.value = await getDoc('Material Request', props.name)
	} catch (e) {
		toast.error(e.messages?.[0] || e.message || 'Failed to load request')
	} finally {
		loading.value = false
	}
})
</script>
