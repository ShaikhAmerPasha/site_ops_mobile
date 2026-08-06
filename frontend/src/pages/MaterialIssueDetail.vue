<template>
	<div class="p-4">
		<PageHeader title="Material Issue" back="/material-issues" />

		<LoadingSpinner v-if="loading" />

		<div v-else-if="doc">
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-base font-semibold text-gray-900">{{ doc.name }}</h3>
				<StatusBadge status="Submitted" />
			</div>
			<p class="mb-1 text-xs text-gray-400">{{ doc.posting_date }} · {{ doc.company }}</p>
			<p v-if="doc.project_cost_center" class="mb-4 text-xs text-gray-500">
				Project Cost Center: <span class="font-medium text-gray-700">{{ doc.project_cost_center }}</span>
			</p>
			<div v-else class="mb-4"></div>

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
						<span>From: {{ row.s_warehouse }}</span>
					</div>
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
		doc.value = await getDoc('Stock Entry', props.name)
	} catch (e) {
		toast.error(e.messages?.[0] || e.message || 'Failed to load material issue')
	} finally {
		loading.value = false
	}
})
</script>
