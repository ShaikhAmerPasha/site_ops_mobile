<template>
	<div class="p-4 pb-24">
		<PageHeader title="New Material Request" back="/material-requests" />

		<div v-if="defaultsLoaded && !warehouses.length" class="mb-4 flex gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
			<Icon name="alert-triangle" class="h-4 w-4 flex-shrink-0" />
			<p>No warehouse is set up for your account yet. Ask your admin to add a Warehouse User Permission before you can submit requests.</p>
		</div>

		<label class="mb-1 block text-xs font-medium text-gray-600">Required by</label>
		<input
			v-model="scheduleDate"
			type="date"
			class="mb-5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
		/>

		<div class="space-y-3">
			<div v-for="(row, idx) in rows" :key="idx" class="rounded-lg border border-gray-200 bg-white p-3.5">
				<div v-if="row.item_code" class="mb-2 flex items-center justify-between">
					<div class="flex items-center gap-2">
						<div class="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-50 text-indigo-500">
							<Icon name="cube" class="h-4 w-4" />
						</div>
						<div>
							<p class="text-sm font-medium text-gray-900">{{ row.item_code }}</p>
							<p class="text-xs text-gray-400">{{ row.item_name }}</p>
						</div>
					</div>
					<button
						type="button"
						class="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600"
						@click="rows.splice(idx, 1)"
					>
						<Icon name="trash" class="h-4 w-4" />
					</button>
				</div>
				<ItemPicker v-else @select="(item) => pickItem(idx, item)" />

				<div v-if="row.item_code" class="mt-3 flex items-center gap-2">
					<label class="text-xs text-gray-600">Qty</label>
					<input
						v-model.number="row.qty"
						type="number"
						min="0.01"
						step="0.01"
						class="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
					/>
					<span class="text-xs text-gray-400">{{ row.uom }}</span>
				</div>

				<div v-if="row.item_code && warehouses.length > 1" class="mt-2">
					<label class="mb-1 block text-xs text-gray-600">Warehouse</label>
					<select
						v-model="row.warehouse"
						class="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
					>
						<option value="" disabled>Select warehouse</option>
						<option v-for="w in warehouses" :key="w.name" :value="w.name">{{ w.name }}</option>
					</select>
				</div>

				<div v-if="row.item_code" class="mt-2">
					<input
						v-model="row.description"
						type="text"
						placeholder="Remarks (optional) — e.g. need urgently, specific brand"
						class="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
					/>
				</div>
			</div>
		</div>

		<button
			type="button"
			class="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 py-2.5 text-sm font-medium text-gray-500 hover:border-gray-400 hover:text-gray-600"
			@click="rows.push({ item_code: '', qty: 1 })"
		>
			<Icon name="plus" class="h-4 w-4" />
			Add item
		</button>

		<AppButton
			block
			size="lg"
			class="mt-5"
			:loading="submitting"
			:disabled="!canSubmit"
			@click="submit"
		>
			{{ submitting ? 'Submitting…' : 'Submit Request' }}
		</AppButton>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ItemPicker from '../components/ItemPicker.vue'
import PageHeader from '../components/PageHeader.vue'
import AppButton from '../components/AppButton.vue'
import Icon from '../components/Icon.vue'
import { getMyDefaults, getList, createAndSubmit } from '../utils/frappeApi'
import { toast } from '../utils/toast'

const router = useRouter()

const scheduleDate = ref(new Date().toISOString().slice(0, 10))
const rows = ref([{ item_code: '', qty: 1 }])
const submitting = ref(false)
const defaults = ref({})
const defaultsLoaded = ref(false)
const warehouses = ref([])

onMounted(async () => {
	defaults.value = await getMyDefaults().catch(() => ({}))
	const warehouseFilters = [['is_group', '=', 0]]
	if (defaults.value.company) warehouseFilters.push(['company', '=', defaults.value.company])
	warehouses.value = await getList('Warehouse', {
		filters: warehouseFilters,
		fields: ['name'],
		limit_page_length: 100,
	}).catch(() => [])
	defaultsLoaded.value = true
})

function pickItem(idx, item) {
	rows.value[idx] = {
		item_code: item.item_code,
		item_name: item.item_name,
		uom: item.stock_uom,
		stock_uom: item.stock_uom,
		conversion_factor: 1,
		qty: 1,
		warehouse: defaultWarehouse(),
		description: '',
	}
}

function defaultWarehouse() {
	if (defaults.value.warehouse) return defaults.value.warehouse
	if (warehouses.value.length === 1) return warehouses.value[0].name
	return ''
}

const canSubmit = computed(
	() =>
		warehouses.value.length &&
		rows.value.length &&
		rows.value.every((r) => r.item_code && r.qty > 0 && r.warehouse),
)

async function submit() {
	submitting.value = true
	try {
		await createAndSubmit({
			doctype: 'Material Request',
			material_request_type: 'Purchase',
			transaction_date: new Date().toISOString().slice(0, 10),
			company: defaults.value.company,
			items: rows.value.map((r) => ({
				item_code: r.item_code,
				qty: r.qty,
				uom: r.uom,
				stock_uom: r.stock_uom,
				conversion_factor: r.conversion_factor,
				schedule_date: scheduleDate.value,
				warehouse: r.warehouse,
				description: r.description || undefined,
			})),
		})
		toast.success('Material Request submitted')
		router.push('/material-requests')
	} catch (e) {
		toast.error(e.messages?.[0] || e.message || 'Failed to submit request.')
	} finally {
		submitting.value = false
	}
}
</script>
