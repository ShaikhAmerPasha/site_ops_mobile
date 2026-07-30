<template>
	<button
		:type="type"
		:disabled="disabled || loading"
		class="inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
		:class="[sizeClasses, variantClasses]"
	>
		<svg
			v-if="loading"
			class="h-4 w-4 animate-spin"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2.5"
		>
			<circle class="opacity-25" cx="12" cy="12" r="10" />
			<path class="opacity-90" d="M22 12a10 10 0 0 0-10-10" />
		</svg>
		<slot />
	</button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	type: { type: String, default: 'button' },
	variant: { type: String, default: 'primary' }, // primary | secondary | danger | ghost
	size: { type: String, default: 'md' }, // sm | md | lg
	disabled: Boolean,
	loading: Boolean,
	block: Boolean,
})

const sizeClasses = computed(() => {
	const sizes = {
		sm: 'px-2.5 py-1.5 text-xs',
		md: 'px-4 py-2.5',
		lg: 'px-5 py-3 text-base',
	}
	return [sizes[props.size], props.block ? 'w-full' : '']
})

const variantClasses = computed(() => {
	const variants = {
		primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800',
		secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100',
		danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
		ghost: 'text-gray-500 hover:bg-gray-100 active:bg-gray-200',
	}
	return variants[props.variant]
})
</script>
