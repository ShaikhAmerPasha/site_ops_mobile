<template>
	<div class="p-4">
		<PageHeader title="New Item" back="/items" />

		<div class="space-y-3">
			<input
				v-model="form.item_code"
				type="text"
				placeholder="Item Code"
				class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
			/>
			<input
				v-model="form.item_name"
				type="text"
				placeholder="Item Name"
				class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
			/>
			<CreatableSelect
				v-model="form.item_group"
				:options="itemGroups"
				placeholder="Item Group"
				doctype="Item Group"
				name-field="item_group_name"
				@created="(doc) => itemGroups.push(doc)"
			/>
			<CreatableSelect
				v-model="form.stock_uom"
				:options="uoms"
				placeholder="UOM"
				doctype="UOM"
				name-field="uom_name"
				@created="(doc) => uoms.push(doc)"
			/>
		</div>

		<AppButton block size="lg" class="mt-5" :loading="submitting" :disabled="!canSubmit" @click="submit">
			{{ submitting ? 'Creating…' : 'Create Item' }}
		</AppButton>
	</div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getList, insertDoc } from '../utils/frappeApi'
import { toast } from '../utils/toast'
import PageHeader from '../components/PageHeader.vue'
import AppButton from '../components/AppButton.vue'
import CreatableSelect from '../components/CreatableSelect.vue'

const router = useRouter()

const form = reactive({ item_code: '', item_name: '', item_group: '', stock_uom: '' })
const itemGroups = ref([])
const uoms = ref([])
const submitting = ref(false)

onMounted(async () => {
	itemGroups.value = await getList('Item Group', { fields: ['name'], limit_page_length: 50 })
	uoms.value = await getList('UOM', { fields: ['name'], limit_page_length: 100 })
})

const canSubmit = computed(
	() => form.item_code && form.item_name && form.item_group && form.stock_uom,
)

async function submit() {
	submitting.value = true
	try {
		await insertDoc({ doctype: 'Item', ...form })
		toast.success('Item created')
		router.push('/items')
	} catch (e) {
		toast.error(e.messages?.[0] || e.message || 'Failed to create item.')
	} finally {
		submitting.value = false
	}
}
</script>
