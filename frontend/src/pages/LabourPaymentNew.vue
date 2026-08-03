<template>
	<div class="p-4 pb-24">
		<PageHeader title="Labour Payment" back="/labour-payments" />

		<LoadingSpinner v-if="loading" />

		<template v-else>
			<div v-if="doc.name" class="mb-4 flex items-center justify-between">
				<h3 class="text-base font-semibold text-gray-900">{{ doc.name }}</h3>
				<StatusBadge :status="doc.workflow_state" />
			</div>

			<label class="mb-1 block text-xs font-medium text-gray-600">Contractor</label>
			<CreatableSelect
				v-if="!doc.name"
				v-model="contractor"
				:options="contractors"
				placeholder="Contractor"
				doctype="Supplier"
				name-field="supplier_name"
				@created="(d) => contractors.push(d)"
			/>
			<p v-else class="mb-4 text-sm text-gray-700">{{ contractor }}</p>

			<label class="mb-1 mt-4 block text-xs font-medium text-gray-600">Project Cost Center</label>
			<CreatableSelect
				v-if="!doc.name"
				v-model="projectCostCenter"
				:options="costCenters"
				placeholder="Project Cost Center"
				doctype="Cost Center"
				name-field="cost_center_name"
				@created="(d) => costCenters.push(d)"
			/>
			<p v-else class="mb-4 text-sm text-gray-700">{{ projectCostCenter }}</p>

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
						<input
							v-model="row.unit"
							type="text"
							placeholder="Unit"
							:disabled="!canEditItems"
							class="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50"
						/>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import AppButton from '../components/AppButton.vue'
import CreatableSelect from '../components/CreatableSelect.vue'
import StatusBadge from '../components/StatusBadge.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import Icon from '../components/Icon.vue'
import { getDoc, getList, insertDoc, saveDoc, applyWorkflowAction } from '../utils/frappeApi'
import { toast } from '../utils/toast'
import { saveDraft, loadDraft, clearDraft } from '../utils/draft'
import { useSessionStore } from '../stores/session'

// Fieldname on the live doctype is documented but unconfirmed on this local
// bench — change here if staging reveals a different fieldname.
const PROJECT_FIELD = 'project_cost_center'

const props = defineProps({ name: String })
const router = useRouter()
const session = useSessionStore()
const draftKey = computed(() => `site_ops_mobile:lpe_draft:${session.user || 'anon'}`)

const doc = ref({})
const loading = ref(true)
const saving = ref(false)
const applyingWorkflow = ref(false)
const contractor = ref('')
const projectCostCenter = ref('')
const rows = ref([{ work_description: '', quantity: 1, unit: '' }])
const contractors = ref([])
const costCenters = ref([])
let restoringDraft = true

const canEditItems = computed(
	() => !doc.value.name || ['Draft', 'Rejected'].includes(doc.value.workflow_state),
)

const workflowAction = computed(() => {
	if (!doc.value.name) return null
	if (doc.value.workflow_state === 'Draft') return 'Mark as Details Updated'
	if (doc.value.workflow_state === 'Rejected') return 'Resubmit'
	return null
})

const canSave = computed(
	() =>
		contractor.value &&
		projectCostCenter.value &&
		rows.value.length &&
		rows.value.every((r) => r.work_description && r.quantity > 0),
)

onMounted(async () => {
	if (!session.user) await session.fetch().catch(() => {})

	contractors.value = await getList('Supplier', { fields: ['name'], limit_page_length: 100 }).catch(() => [])
	costCenters.value = await getList('Cost Center', {
		filters: [['is_group', '=', 0]],
		fields: ['name'],
		limit_page_length: 100,
	}).catch(() => [])

	if (props.name) {
		try {
			doc.value = await getDoc('Labour Payment Entry', props.name)
			contractor.value = doc.value.contractor || ''
			projectCostCenter.value = doc.value[PROJECT_FIELD] || ''
			if (Array.isArray(doc.value.work_items) && doc.value.work_items.length) {
				rows.value = doc.value.work_items.map((r) => ({
					work_description: r.work_description,
					quantity: r.quantity,
					unit: r.unit,
				}))
			}
		} catch (e) {
			toast.error(e.messages?.[0] || e.message || 'Failed to load labour payment entry')
		}
	} else {
		const draft = loadDraft(draftKey.value)
		if (draft) {
			contractor.value = draft.contractor || ''
			projectCostCenter.value = draft.projectCostCenter || ''
			if (Array.isArray(draft.rows) && draft.rows.length) rows.value = draft.rows
			toast.success('Restored your unsaved draft')
		}
	}
	restoringDraft = false
	loading.value = false
})

watch(
	[contractor, projectCostCenter, rows],
	() => {
		if (restoringDraft || doc.value.name) return
		saveDraft(draftKey.value, {
			contractor: contractor.value,
			projectCostCenter: projectCostCenter.value,
			rows: rows.value,
		})
	},
	{ deep: true },
)

async function save() {
	saving.value = true
	try {
		const workItems = rows.value.map((r) => ({
			work_description: r.work_description,
			quantity: r.quantity,
			unit: r.unit,
		}))
		if (!doc.value.name) {
			doc.value = await insertDoc({
				doctype: 'Labour Payment Entry',
				contractor: contractor.value,
				[PROJECT_FIELD]: projectCostCenter.value,
				work_items: workItems,
			})
			clearDraft(draftKey.value)
			toast.success('Saved as draft')
			router.replace(`/labour-payments/${doc.value.name}`)
		} else {
			doc.value = await saveDoc({ ...doc.value, work_items: workItems })
			toast.success('Saved')
		}
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
