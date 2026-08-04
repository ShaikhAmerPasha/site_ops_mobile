<template>
	<div class="p-4 pb-24">
		<PageHeader title="Issue Material" back="/material-issues" />

		<div v-if="defaultsLoaded && !warehouses.length" class="mb-4 flex gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
			<Icon name="alert-triangle" class="h-4 w-4 flex-shrink-0" />
			<p>No warehouse is set up for your account yet. Ask your admin to add a Warehouse User Permission before you can issue material.</p>
		</div>

		<label class="mb-1 block text-xs font-medium text-gray-600">Project Cost Center</label>
		<CreatableSelect
			v-model="projectCostCenter"
			:options="costCenters"
			placeholder="Project Cost Center"
			doctype="Cost Center"
			name-field="cost_center_name"
			:extra-fields="costCenterExtraFields"
			@created="(doc) => costCenters.push(doc)"
		/>

		<div class="mt-5 space-y-3">
			<div v-for="(row, idx) in rows" :key="idx" class="rounded-lg border border-gray-200 bg-white p-3.5">
				<div class="mb-2 flex items-center justify-between gap-2">
					<div v-if="row.item_code" class="flex min-w-0 items-center gap-2">
						<div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-500">
							<Icon name="cube" class="h-4 w-4" />
						</div>
						<div class="min-w-0">
							<p class="truncate text-sm font-medium text-gray-900">{{ row.item_code }}</p>
							<p class="truncate text-xs text-gray-400">{{ row.item_name }}</p>
						</div>
					</div>
					<ItemPicker v-else class="flex-1" @select="(item) => pickItem(idx, item)" />
					<button
						type="button"
						class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600"
						title="Remove this item"
						@click="rows.splice(idx, 1)"
					>
						<Icon name="trash" class="h-4 w-4" />
					</button>
				</div>

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

				<div v-if="row.item_code" class="mt-2">
					<label class="mb-1 block text-xs text-gray-600">Warehouse</label>
					<CreatableSelect
						v-model="row.warehouse"
						:options="warehouses"
						placeholder="Warehouse"
						doctype="Warehouse"
						name-field="warehouse_name"
						:extra-fields="warehouseExtraFields"
						@created="(doc) => warehouses.push(doc)"
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
			{{ submitting ? 'Submitting…' : 'Issue Material' }}
		</AppButton>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import ItemPicker from '../components/ItemPicker.vue'
import PageHeader from '../components/PageHeader.vue'
import AppButton from '../components/AppButton.vue'
import CreatableSelect from '../components/CreatableSelect.vue'
import Icon from '../components/Icon.vue'
import { getMyDefaults, getList, createAndSubmit } from '../utils/frappeApi'
import { toast } from '../utils/toast'
import { saveDraft, loadDraft, clearDraft } from '../utils/draft'
import { useSessionStore } from '../stores/session'

const router = useRouter()
const session = useSessionStore()
const draftKey = computed(() => `site_ops_mobile:mi_draft:${session.user || 'anon'}`)

const projectCostCenter = ref('')
const rows = ref([{ item_code: '', qty: 1 }])
const submitting = ref(false)
const defaults = ref({})
const defaultsLoaded = ref(false)
const warehouses = ref([])
const costCenters = ref([])
const rootWarehouse = ref('')
const rootCostCenter = ref('')
let restoringDraft = true

const warehouseExtraFields = computed(() => ({
	company: defaults.value.company,
	parent_warehouse: rootWarehouse.value,
}))
const costCenterExtraFields = computed(() => ({
	company: defaults.value.company,
	parent_cost_center: rootCostCenter.value,
}))

onMounted(async () => {
	if (!session.user) await session.fetch().catch(() => {})
	const draft = loadDraft(draftKey.value)
	if (draft) {
		projectCostCenter.value = draft.projectCostCenter || ''
		if (Array.isArray(draft.rows) && draft.rows.length) rows.value = draft.rows
		toast.success('Restored your unsaved draft')
	}
	restoringDraft = false

	defaults.value = session.defaults?.company ? session.defaults : await getMyDefaults().catch(() => ({}))
	const company = defaults.value.company

	const companyFilter = (extra = []) => (company ? [['company', '=', company], ...extra] : extra)

	warehouses.value = await getList('Warehouse', {
		filters: companyFilter([['is_group', '=', 0]]),
		fields: ['name'],
		limit_page_length: 100,
	}).catch(() => [])

	costCenters.value = await getList('Cost Center', {
		filters: companyFilter([['is_group', '=', 0]]),
		fields: ['name'],
		limit_page_length: 100,
	}).catch(() => [])

	if (company) {
		const [rootWh] = await getList('Warehouse', {
			filters: [
				['company', '=', company],
				['is_group', '=', 1],
				['parent_warehouse', 'in', ['', null]],
			],
			fields: ['name'],
			limit_page_length: 1,
		}).catch(() => [])
		rootWarehouse.value = rootWh?.name || ''

		const [rootCc] = await getList('Cost Center', {
			filters: [
				['company', '=', company],
				['is_group', '=', 1],
				['parent_cost_center', 'in', ['', null]],
			],
			fields: ['name'],
			limit_page_length: 1,
		}).catch(() => [])
		rootCostCenter.value = rootCc?.name || ''
	}

	defaultsLoaded.value = true
})

watch(
	[projectCostCenter, rows],
	() => {
		if (restoringDraft) return
		saveDraft(draftKey.value, {
			projectCostCenter: projectCostCenter.value,
			rows: rows.value,
		})
	},
	{ deep: true },
)

function pickItem(idx, item) {
	rows.value[idx] = {
		item_code: item.item_code,
		item_name: item.item_name,
		uom: item.stock_uom,
		stock_uom: item.stock_uom,
		conversion_factor: 1,
		qty: 1,
		warehouse: defaultWarehouse(),
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
		projectCostCenter.value &&
		rows.value.length &&
		rows.value.every((r) => r.item_code && r.qty > 0 && r.warehouse),
)

async function submit() {
	submitting.value = true
	try {
		await createAndSubmit({
			doctype: 'Material Request',
			material_request_type: 'Material Issue',
			transaction_date: new Date().toISOString().slice(0, 10),
			company: defaults.value.company,
			project_cost_center: projectCostCenter.value,
			items: rows.value.map((r) => ({
				item_code: r.item_code,
				qty: r.qty,
				uom: r.uom,
				stock_uom: r.stock_uom,
				conversion_factor: r.conversion_factor,
				schedule_date: new Date().toISOString().slice(0, 10),
				warehouse: r.warehouse,
			})),
		})
		clearDraft(draftKey.value)
		toast.success('Material issued')
		router.push('/material-issues')
	} catch (e) {
		toast.error(e.messages?.[0] || e.message || 'Failed to issue material.')
	} finally {
		submitting.value = false
	}
}
</script>
