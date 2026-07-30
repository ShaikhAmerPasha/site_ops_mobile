<template>
	<div class="p-4">
		<PageHeader title="Receipt" back="/purchase-receipts" />

		<LoadingSpinner v-if="loading" />

		<div v-else-if="doc">
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-base font-semibold text-gray-900">{{ doc.name }}</h3>
				<StatusBadge :status="doc.status" />
			</div>
			<p class="mb-4 text-xs text-gray-400">{{ doc.supplier }} · {{ doc.posting_date }}</p>

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
					<p class="mt-2 text-xs text-gray-500">
						Received: <strong class="text-gray-700">{{ row.received_qty }} {{ row.uom }}</strong>
					</p>
				</div>
			</div>

			<div v-if="photos.length" class="mt-4">
				<p class="mb-2 text-xs font-medium text-gray-600">Delivery photos</p>
				<div class="flex flex-wrap gap-2">
					<a v-for="p in photos" :key="p.name" :href="p.file_url" target="_blank">
						<img :src="p.file_url" class="h-24 w-24 rounded-lg border object-cover" />
					</a>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDoc, getList } from '../utils/frappeApi'
import { toast } from '../utils/toast'
import PageHeader from '../components/PageHeader.vue'
import StatusBadge from '../components/StatusBadge.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import Icon from '../components/Icon.vue'

const props = defineProps({ name: String })

const doc = ref(null)
const photos = ref([])
const loading = ref(true)

onMounted(async () => {
	try {
		doc.value = await getDoc('Purchase Receipt', props.name)
		photos.value = await getList('File', {
			filters: [
				['attached_to_doctype', '=', 'Purchase Receipt'],
				['attached_to_name', '=', props.name],
			],
			fields: ['name', 'file_url'],
		})
	} catch (e) {
		toast.error(e.messages?.[0] || e.message || 'Failed to load receipt')
	} finally {
		loading.value = false
	}
})
</script>
