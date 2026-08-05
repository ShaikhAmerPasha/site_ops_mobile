<template>
	<div class="p-4 pb-24">
		<PageHeader title="Receive" back="/purchase-orders" />

		<LoadingSpinner v-if="loading" />

		<div v-else-if="doc">
			<p class="mb-1 text-sm font-medium text-gray-900">{{ po }}</p>
			<p class="mb-1 text-xs text-gray-400">{{ doc.supplier }} · {{ doc.posting_date }}</p>
			<div class="mb-4 mt-3 flex gap-2 rounded-lg bg-indigo-50 p-3 text-xs text-indigo-700">
				<Icon name="alert-triangle" class="h-4 w-4 flex-shrink-0" />
				<p>Receiving the full pending quantity for each item.</p>
			</div>

			<div class="space-y-3">
				<div v-for="(row, idx) in doc.items" :key="idx" class="rounded-lg border border-gray-200 bg-white p-3.5">
					<div class="flex items-center gap-2">
						<div class="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-50 text-indigo-500">
							<Icon name="cube" class="h-4 w-4" />
						</div>
						<div>
							<p class="text-sm font-medium text-gray-900">{{ row.item_code }}</p>
							<p class="text-xs text-gray-400">{{ row.item_name }}</p>
						</div>
					</div>
					<p class="mt-2 text-xs text-gray-400">Pending: {{ row.pendingQty }} {{ row.uom }}</p>
					<div class="mt-1.5 flex items-center gap-2">
						<label class="text-xs font-medium text-gray-700">Receiving now</label>
						<input
							:value="row.qty"
							type="number"
							readonly
							disabled
							class="w-24 rounded-md border border-gray-300 bg-gray-50 px-2 py-1 text-sm font-medium text-gray-700"
						/>
						<span class="text-xs text-gray-400">{{ row.uom }}</span>
					</div>
				</div>
			</div>

			<div class="mt-5">
				<label class="mb-2 block text-xs font-medium text-gray-600">Photo of delivery (optional)</label>
				<label
					class="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-4 text-sm text-gray-500 hover:border-gray-400"
				>
					<Icon name="camera" class="h-5 w-5" />
					{{ photo ? 'Change photo' : 'Take or choose a photo' }}
					<input type="file" accept="image/*" capture="environment" class="hidden" @change="onPhotoPicked" />
				</label>
				<img v-if="photoPreview" :src="photoPreview" class="mt-2 h-32 w-32 rounded-lg border object-cover" />
			</div>

			<AppButton block size="lg" class="mt-5" :loading="submitting" @click="submit">
				{{ submitting ? 'Submitting…' : 'Submit Receipt' }}
			</AppButton>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { makePurchaseReceipt, createAndSubmit, uploadFile } from '../utils/frappeApi'
import { toast } from '../utils/toast'
import PageHeader from '../components/PageHeader.vue'
import AppButton from '../components/AppButton.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import Icon from '../components/Icon.vue'

const props = defineProps({ po: String })
const router = useRouter()

const doc = ref(null)
const loading = ref(true)
const submitting = ref(false)
const photo = ref(null)
const photoPreview = ref('')

function onPhotoPicked(e) {
	const file = e.target.files?.[0]
	if (!file) return
	photo.value = file
	photoPreview.value = URL.createObjectURL(file)
}

onMounted(async () => {
	try {
		doc.value = await makePurchaseReceipt(props.po)
		doc.value.items.forEach((row) => {
			row.pendingQty = row.qty
		})
	} catch (e) {
		toast.error(e.messages?.[0] || e.message || 'Failed to load purchase order')
	} finally {
		loading.value = false
	}
})

async function submit() {
	submitting.value = true
	let saved = null
	try {
		const payload = {
			...doc.value,
			items: doc.value.items.map(({ pendingQty, ...row }) => ({
				...row,
				received_qty: row.qty,
			})),
		}
		saved = await createAndSubmit(payload)
	} catch (e) {
		toast.error(e.messages?.[0] || e.message || 'Failed to submit receipt.')
		submitting.value = false
		return
	}

	// The receipt is already saved and submitted at this point — a failure
	// from here on (e.g. the photo upload) must never be reported as a
	// failed submission, or the engineer may retry and create a duplicate.
	if (photo.value) {
		try {
			await uploadFile(photo.value, 'Purchase Receipt', saved.name)
		} catch (e) {
			toast.error(
				`Receipt ${saved.name} submitted, but the photo failed to attach: ${e.messages?.[0] || e.message || 'unknown error'}. You can add it later from Desk.`,
			)
			submitting.value = false
			router.push(`/purchase-receipts/${saved.name}`)
			return
		}
	}

	toast.success('Receipt submitted')
	submitting.value = false
	router.push(`/purchase-receipts/${saved.name}`)
}
</script>
