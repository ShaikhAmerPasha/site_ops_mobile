<template>
	<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" :class="classes">
		{{ status }}
	</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ status: { type: String, default: '' } })

const MAP = {
	Draft: 'bg-gray-100 text-gray-600',
	Cancelled: 'bg-red-100 text-red-700',
	Rejected: 'bg-red-100 text-red-700',
	Pending: 'bg-amber-100 text-amber-700',
	'To Receive and Bill': 'bg-amber-100 text-amber-700',
	'To Receive': 'bg-amber-100 text-amber-700',
	'To Bill': 'bg-blue-100 text-blue-700',
	Completed: 'bg-green-100 text-green-700',
	Submitted: 'bg-green-100 text-green-700',
}

const classes = computed(() => MAP[props.status] || 'bg-green-100 text-green-700')
</script>
