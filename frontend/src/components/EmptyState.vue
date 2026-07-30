<template>
	<div class="flex flex-col items-center justify-center px-6 py-16 text-center">
		<div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
			<Icon :name="icon" class="h-6 w-6" />
		</div>
		<p class="text-sm font-medium text-gray-700">{{ title }}</p>
		<p v-if="subtitle" class="mt-1 text-xs text-gray-400">{{ subtitle }}</p>
		<div v-if="$slots.default" class="mt-4">
			<slot />
		</div>
	</div>
</template>

<script setup>
import Icon from './Icon.vue'

defineProps({
	icon: { type: String, default: 'inbox' },
	title: { type: String, required: true },
	subtitle: { type: String, default: '' },
})
</script>
