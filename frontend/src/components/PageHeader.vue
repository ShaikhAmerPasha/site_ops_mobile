<template>
	<div class="mb-4 flex items-center justify-between">
		<div class="flex items-center gap-2">
			<router-link
				v-if="back"
				:to="back"
				class="-ml-1.5 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 active:bg-gray-200"
			>
				<Icon name="chevron-left" class="h-5 w-5" />
			</router-link>
			<h2 class="text-lg font-semibold text-gray-900">{{ title }}</h2>
		</div>
		<slot name="action" />
	</div>
</template>

<script setup>
import Icon from './Icon.vue'

defineProps({
	title: { type: String, required: true },
	back: { type: String, default: '' },
})
</script>
