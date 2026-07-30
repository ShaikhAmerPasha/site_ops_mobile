<template>
	<div class="p-4">
		<PageHeader title="Items">
			<template #action>
				<AppButton size="sm" @click="router.push('/items/new')">
					<Icon name="plus" class="h-4 w-4" />
					New
				</AppButton>
			</template>
		</PageHeader>

		<div class="relative mb-4">
			<Icon name="search" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
			<input
				v-model="query"
				type="text"
				placeholder="Search item code or name…"
				class="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
				@input="search"
			/>
		</div>

		<LoadingSpinner v-if="loading" />
		<EmptyState v-else-if="!items.length" icon="cube" title="No items found" />

		<div v-else class="space-y-2">
			<div v-for="item in items" :key="item.item_code" class="rounded-lg border border-gray-200 bg-white p-3.5">
				<div class="flex items-center gap-2">
					<div class="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-50 text-indigo-500">
						<Icon name="cube" class="h-4 w-4" />
					</div>
					<div>
						<p class="text-sm font-medium text-gray-900">{{ item.item_code }}</p>
						<p class="text-xs text-gray-400">{{ item.item_name }} · {{ item.item_group }}</p>
					</div>
				</div>
			</div>

			<div ref="sentinel" class="h-1"></div>

			<LoadingSpinner v-if="loadingMore" label="Loading more…" />

			<button
				v-else-if="hasMore"
				type="button"
				class="w-full rounded-lg border border-dashed border-gray-300 py-2.5 text-sm font-medium text-gray-500 hover:border-gray-400 hover:text-gray-600"
				@click="loadMore"
			>
				Load more{{ !query && totalCount ? ` (${totalCount - items.length} remaining)` : '' }}
			</button>

			<p class="text-center text-xs text-gray-400">
				<template v-if="query">Showing {{ items.length }} result{{ items.length === 1 ? '' : 's' }}</template>
				<template v-else-if="totalCount">Showing {{ items.length }} of {{ totalCount }}</template>
			</p>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getList, getCount } from '../utils/frappeApi'
import { toast } from '../utils/toast'
import PageHeader from '../components/PageHeader.vue'
import AppButton from '../components/AppButton.vue'
import EmptyState from '../components/EmptyState.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import Icon from '../components/Icon.vue'

const PAGE_SIZE = 30

const router = useRouter()
const query = ref('')
const items = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const hasMore = ref(false)
const totalCount = ref(0)
const sentinel = ref(null)
let observer = null

function currentFilters() {
	return query.value
		? [
				['item_code', 'like', `%${query.value}%`],
				['item_name', 'like', `%${query.value}%`],
			]
		: []
}

async function fetchItems() {
	loading.value = true
	try {
		const result = await getList('Item', {
			or_filters: currentFilters(),
			fields: ['item_code', 'item_name', 'item_group'],
			order_by: 'creation desc',
			limit_start: 0,
			limit_page_length: PAGE_SIZE,
		})
		items.value = result
		hasMore.value = result.length === PAGE_SIZE
		if (!query.value) {
			totalCount.value = await getCount('Item').catch(() => 0)
		}
	} catch (e) {
		toast.error(e.messages?.[0] || e.message || 'Failed to load items')
	} finally {
		loading.value = false
	}
}

async function loadMore() {
	loadingMore.value = true
	try {
		const result = await getList('Item', {
			or_filters: currentFilters(),
			fields: ['item_code', 'item_name', 'item_group'],
			order_by: 'creation desc',
			limit_start: items.value.length,
			limit_page_length: PAGE_SIZE,
		})
		items.value = items.value.concat(result)
		hasMore.value = result.length === PAGE_SIZE
	} catch (e) {
		toast.error(e.messages?.[0] || e.message || 'Failed to load more items')
	} finally {
		loadingMore.value = false
	}
}

let searchTimeout = null
function search() {
	clearTimeout(searchTimeout)
	searchTimeout = setTimeout(fetchItems, 300)
}

onMounted(async () => {
	await fetchItems()
	observer = new IntersectionObserver(
		(entries) => {
			if (entries[0].isIntersecting && hasMore.value && !loadingMore.value && !loading.value) {
				loadMore()
			}
		},
		{ root: document.querySelector('main'), rootMargin: '150px' },
	)
	if (sentinel.value) observer.observe(sentinel.value)
})

onUnmounted(() => observer?.disconnect())
</script>
