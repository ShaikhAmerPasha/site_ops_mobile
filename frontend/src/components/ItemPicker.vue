<template>
	<div class="relative">
		<div class="relative">
			<Icon name="search" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
			<input
				v-model="query"
				type="text"
				placeholder="Search item code or name…"
				class="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
				@focus="showResults = true"
				@input="search"
			/>
		</div>

		<div
			v-if="showResults && (results.length || query.length > 1)"
			class="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
		>
			<button
				v-for="item in results"
				:key="item.item_code"
				type="button"
				class="block w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50"
				@click="select(item)"
			>
				<span class="font-medium text-gray-900">{{ item.item_code }}</span>
				<span class="text-gray-400"> — {{ item.item_name }}</span>
			</button>

			<button
				type="button"
				class="flex w-full items-center gap-1.5 border-t px-3 py-2.5 text-left text-sm font-medium text-indigo-600 hover:bg-indigo-50"
				@click="openCreate"
			>
				<Icon name="plus" class="h-4 w-4" />
				Create new item{{ query ? ` "${query}"` : '' }}
			</button>
		</div>

		<div v-if="creating" class="mt-2 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
			<p class="text-xs font-medium text-gray-600">New item</p>
			<input
				v-model="newItem.item_code"
				type="text"
				placeholder="Item Code"
				class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
			/>
			<input
				v-model="newItem.item_name"
				type="text"
				placeholder="Item Name"
				class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
			/>
			<CreatableSelect
				v-model="newItem.item_group"
				:options="itemGroups"
				placeholder="Item Group"
				doctype="Item Group"
				name-field="item_group_name"
				@created="(doc) => itemGroups.push(doc)"
			/>
			<CreatableSelect
				v-model="newItem.stock_uom"
				:options="uoms"
				placeholder="UOM"
				doctype="UOM"
				name-field="uom_name"
				@created="(doc) => uoms.push(doc)"
			/>
			<p v-if="createError" class="text-xs text-red-600">{{ createError }}</p>
			<div class="flex gap-2">
				<AppButton class="flex-1" :loading="creatingBusy" @click="submitCreate">
					{{ creatingBusy ? 'Creating…' : 'Create & select' }}
				</AppButton>
				<AppButton variant="secondary" @click="creating = false">Cancel</AppButton>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { getList, insertDoc } from '../utils/frappeApi'
import CreatableSelect from './CreatableSelect.vue'
import AppButton from './AppButton.vue'
import Icon from './Icon.vue'

const emit = defineEmits(['select'])

const query = ref('')
const results = ref([])
const showResults = ref(false)
const creating = ref(false)
const creatingBusy = ref(false)
const createError = ref('')
const itemGroups = ref([])
const uoms = ref([])

const newItem = reactive({
	item_code: '',
	item_name: '',
	item_group: '',
	stock_uom: '',
})

let searchTimeout = null
function search() {
	showResults.value = true
	clearTimeout(searchTimeout)
	searchTimeout = setTimeout(async () => {
		if (!query.value) {
			results.value = []
			return
		}
		results.value = await getList('Item', {
			filters: [['item_code', 'like', `%${query.value}%`]],
			or_filters: [
				['item_code', 'like', `%${query.value}%`],
				['item_name', 'like', `%${query.value}%`],
			],
			fields: ['item_code', 'item_name', 'stock_uom'],
			limit_page_length: 10,
		})
	}, 300)
}

function select(item) {
	query.value = ''
	results.value = []
	showResults.value = false
	creating.value = false
	emit('select', item)
}

async function openCreate() {
	newItem.item_code = query.value
	newItem.item_name = query.value
	creating.value = true
	showResults.value = false
	if (!itemGroups.value.length) {
		itemGroups.value = await getList('Item Group', { fields: ['name'], limit_page_length: 50 })
	}
	if (!uoms.value.length) {
		uoms.value = await getList('UOM', { fields: ['name'], limit_page_length: 100 })
	}
}

async function submitCreate() {
	createError.value = ''
	if (!newItem.item_code || !newItem.item_name || !newItem.item_group || !newItem.stock_uom) {
		createError.value = 'All fields are required.'
		return
	}
	creatingBusy.value = true
	try {
		const item = await insertDoc({
			doctype: 'Item',
			item_code: newItem.item_code,
			item_name: newItem.item_name,
			item_group: newItem.item_group,
			stock_uom: newItem.stock_uom,
		})
		creating.value = false
		select(item)
	} catch (e) {
		createError.value = e.messages?.[0] || e.message || 'Failed to create item.'
	} finally {
		creatingBusy.value = false
	}
}
</script>
