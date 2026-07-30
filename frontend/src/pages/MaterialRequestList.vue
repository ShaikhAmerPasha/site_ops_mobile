<template>
	<div class="p-4">
		<PageHeader title="Material Requests">
			<template #action>
				<AppButton size="sm" @click="router.push('/material-requests/new')">
					<Icon name="plus" class="h-4 w-4" />
					New
				</AppButton>
			</template>
		</PageHeader>

		<LoadingSpinner v-if="loading" />
		<EmptyState
			v-else-if="!items.length"
			icon="clipboard-list"
			title="No material requests yet"
			subtitle="Requests you raise will show up here"
		>
			<AppButton size="sm" @click="router.push('/material-requests/new')">New Request</AppButton>
		</EmptyState>

		<div v-else class="space-y-2">
			<router-link
				v-for="mr in items"
				:key="mr.name"
				:to="`/material-requests/${mr.name}`"
				class="block rounded-lg border border-gray-200 bg-white p-3.5 transition-colors active:bg-gray-50"
			>
				<div class="flex items-center justify-between gap-2">
					<span class="font-medium text-gray-900">{{ mr.name }}</span>
					<StatusBadge :status="mr.status" />
				</div>
				<p class="mt-1 text-xs text-gray-400">{{ mr.transaction_date }}</p>
			</router-link>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getList } from '../utils/frappeApi'
import { toast } from '../utils/toast'
import PageHeader from '../components/PageHeader.vue'
import AppButton from '../components/AppButton.vue'
import StatusBadge from '../components/StatusBadge.vue'
import EmptyState from '../components/EmptyState.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import Icon from '../components/Icon.vue'

const router = useRouter()
const items = ref([])
const loading = ref(true)

onMounted(async () => {
	try {
		items.value = await getList('Material Request', {
			fields: ['name', 'status', 'transaction_date'],
			order_by: 'creation desc',
			limit_page_length: 50,
		})
	} catch (e) {
		toast.error(e.messages?.[0] || e.message || 'Failed to load requests')
	} finally {
		loading.value = false
	}
})
</script>
