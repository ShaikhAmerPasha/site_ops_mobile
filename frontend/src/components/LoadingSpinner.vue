<template>
	<div class="flex items-center justify-center gap-2 py-10 text-gray-400">
		<svg class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
			<circle class="opacity-20" cx="12" cy="12" r="10" />
			<path class="opacity-80" d="M22 12a10 10 0 0 0-10-10" />
		</svg>
		<span class="text-sm">{{ label }}</span>
	</div>
</template>

<script setup>
defineProps({ label: { type: String, default: 'Loading…' } })
</script>
