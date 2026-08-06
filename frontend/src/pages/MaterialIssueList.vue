<template>
	<div class="p-4">
		<PageHeader title="Material Issue">
			<template #action>
				<AppButton size="sm" @click="router.push('/material-issues/new')">
					<Icon name="plus" class="h-4 w-4" />
					New
				</AppButton>
			</template>
		</PageHeader>

		<LoadingSpinner v-if="loading" />
		<EmptyState
			v-else-if="!entries.length"
			icon="archive"
			title="No material issued yet"
			subtitle="Material issued to site — from here or from Desk — will show up here"
		>
			<AppButton size="sm" @click="router.push('/material-issues/new')">Issue Material</AppButton>
		</EmptyState>

		<div v-else class="space-y-2">
			<router-link
				v-for="se in entries"
				:key="se.name"
				:to="`/material-issues/${se.name}`"
				class="block rounded-lg border border-gray-200 bg-white p-3.5 transition-colors active:bg-gray-50"
			>
				<div class="flex items-center justify-between gap-2">
					<span class="font-medium text-gray-900">{{ se.name }}</span>
					<StatusBadge status="Submitted" />
				</div>
				<p class="mt-1 text-xs text-gray-400">{{ se.posting_date }}</p>
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
const entries = ref([])
const loading = ref(true)

onMounted(async () => {
	try {
		entries.value = await getList('Stock Entry', {
			filters: [
				['purpose', '=', 'Material Issue'],
				['docstatus', '=', 1],
			],
			fields: ['name', 'posting_date'],
			order_by: 'posting_date desc',
			limit_page_length: 50,
		})
	} catch (e) {
		toast.error(e.messages?.[0] || e.message || 'Failed to load material issues')
	} finally {
		loading.value = false
	}
})
</script>
