<template>
	<div class="p-4 pb-24">
		<PageHeader title="Labour Payment" back="/labour-payments" />

		<LoadingSpinner v-if="loading" />

		<template v-else-if="doc.name">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-base font-semibold text-gray-900">{{ doc.name }}</h3>
				<StatusBadge :status="doc.workflow_state" />
			</div>

			<label class="mb-1 block text-xs font-medium text-gray-600">Contractor</label>
			<p class="mb-4 text-sm text-gray-700">{{ contractor }}</p>

			<label class="mb-1 block text-xs font-medium text-gray-600">Project Cost Center</label>
			<p class="mb-4 text-sm text-gray-700">{{ projectCostCenter }}</p>

			<div class="mt-5 space-y-3">
				<div v-for="(row, idx) in rows" :key="idx" class="rounded-lg border border-gray-200 bg-white p-3.5">
					<div class="mb-2 flex items-center justify-between gap-2">
						<label class="text-xs font-medium text-gray-600">Work item</label>
						<button
							v-if="canEditItems"
							type="button"
							class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600"
							title="Remove this item"
							@click="rows.splice(idx, 1)"
						>
							<Icon name="trash" class="h-4 w-4" />
						</button>
					</div>
					<input
						v-model="row.work_description"
						type="text"
						placeholder="Work description"
						:disabled="!canEditItems"
						class="mb-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50"
					/>
					<div class="flex items-center gap-2">
						<label class="text-xs text-gray-600">Qty</label>
						<input
							v-model.number="row.quantity"
							type="number"
							min="0.01"
							step="0.01"
							:disabled="!canEditItems"
							class="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50"
						/>
						<select
							v-model="row.unit"
							:disabled="!canEditItems"
							class="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50"
						>
							<option value="" disabled>Unit</option>
							<option v-for="u in UNIT_OPTIONS" :key="u" :value="u">{{ u }}</option>
						</select>
					</div>
				</div>
			</div>

			<button
				v-if="canEditItems"
				type="button"
				class="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 py-2.5 text-sm font-medium text-gray-500 hover:border-gray-400 hover:text-gray-600"
				@click="rows.push({ work_description: '', quantity: 1, unit: '' })"
			>
				<Icon name="plus" class="h-4 w-4" />
				Add work item
			</button>

			<AppButton
				v-if="canEditItems"
				block
				size="lg"
				class="mt-5"
				:loading="saving"
				:disabled="!canSave"
				@click="save"
			>
				{{ saving ? 'Saving…' : 'Save' }}
			</AppButton>

			<AppButton
				v-if="workflowAction"
				block
				variant="secondary"
				size="lg"
				class="mt-2.5"
				:loading="applyingWorkflow"
				:disabled="applyingWorkflow"
				@click="runWorkflowAction"
			>
				{{ applyingWorkflow ? 'Please wait…' : workflowAction }}
			</AppButton>
		</template>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import AppButton from '../components/AppButton.vue'
import StatusBadge from '../components/StatusBadge.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import Icon from '../components/Icon.vue'
import { getDoc, saveDoc, applyWorkflowAction } from '../utils/frappeApi'
import { toast } from '../utils/toast'

// Fieldname on the live doctype is documented but unconfirmed on this local
// bench — change here if staging reveals a different fieldname.
const PROJECT_FIELD = 'project_cost_center'

// Options list for the unit Select field — confirm exact set/spelling
// against the live doctype on staging; a value loaded from an existing doc
// that isn't in this list won't show as selected.
const UNIT_OPTIONS = ['Nos', 'Day', 'Sqft', 'Sqm', 'Kg', 'Ton', 'Cft', 'Rmt', 'Load', 'Bag', 'Ltr', 'Hour']

// Site Manager can only open and update work_items on an existing Draft
// entry — never create one, so this page is edit-only (name is required).
const props = defineProps({ name: { type: String, required: true } })

const doc = ref({})
const loading = ref(true)
const saving = ref(false)
const applyingWorkflow = ref(false)
const contractor = ref('')
const projectCostCenter = ref('')
const rows = ref([])

// docstatus is a core Frappe field, guaranteed to exist regardless of the
// real workflow field name — a submitted doc (docstatus 1) is never
// editable. Within an unsubmitted doc, only block editing when
// workflow_state is explicitly a known non-Draft value; if that field name
// turns out to differ from our guess (unconfirmed on production), this
// still lets the Site Manager fill work_items instead of silently locking
// the whole form.
const canEditItems = computed(() => {
	if (doc.value.docstatus !== 0) return false
	const state = doc.value.workflow_state
	return !state || state === 'Draft'
})

const workflowAction = computed(() => {
	if (doc.value.name && doc.value.workflow_state === 'Draft') return 'Mark as Details Updated'
	return null
})

const canSave = computed(
	() => rows.value.length && rows.value.every((r) => r.work_description && r.quantity > 0),
)

onMounted(async () => {
	try {
		doc.value = await getDoc('Labour Payment Entry', props.name)
		contractor.value = doc.value.contractor || ''
		projectCostCenter.value = doc.value[PROJECT_FIELD] || ''
		rows.value = (doc.value.work_items || []).map((r) => ({
			work_description: r.work_description,
			quantity: r.quantity,
			unit: r.unit,
		}))
	} catch (e) {
		toast.error(e.messages?.[0] || e.message || 'Failed to load labour payment entry')
	} finally {
		loading.value = false
	}
})

async function save() {
	saving.value = true
	try {
		const workItems = rows.value.map((r) => ({
			work_description: r.work_description,
			quantity: r.quantity,
			unit: r.unit,
		}))
		doc.value = await saveDoc({ ...doc.value, work_items: workItems })
		toast.success('Saved')
	} catch (e) {
		toast.error(e.messages?.[0] || e.message || 'Failed to save.')
	} finally {
		saving.value = false
	}
}

async function runWorkflowAction() {
	if (!workflowAction.value) return
	applyingWorkflow.value = true
	try {
		await applyWorkflowAction('Labour Payment Entry', doc.value.name, workflowAction.value)
		doc.value = await getDoc('Labour Payment Entry', doc.value.name)
		toast.success(`Marked as ${doc.value.workflow_state}`)
	} catch (e) {
		toast.error(e.messages?.[0] || e.message || 'Failed to update status.')
	} finally {
		applyingWorkflow.value = false
	}
}
</script>
