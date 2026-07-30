<template>
	<div class="pointer-events-none fixed inset-x-0 top-3 z-50 flex flex-col items-center gap-2 px-4">
		<transition-group name="toast">
			<div
				v-for="t in toasts"
				:key="t.id"
				class="pointer-events-auto flex max-w-sm items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg"
				:class="t.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'"
			>
				<Icon :name="t.type === 'error' ? 'alert-triangle' : 'check-circle'" class="h-4 w-4 flex-shrink-0" />
				{{ t.message }}
			</div>
		</transition-group>
	</div>
</template>

<script setup>
import Icon from './Icon.vue'
import { toasts } from '../utils/toast'
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
	transition: all 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
	opacity: 0;
	transform: translateY(-8px);
}
</style>
