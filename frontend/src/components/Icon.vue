<template>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="1.75"
		stroke-linecap="round"
		stroke-linejoin="round"
		v-bind="$attrs"
	>
		<path :d="path" />
		<path v-if="path2" :d="path2" />
	</svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ name: { type: String, required: true } })

const paths = {
	'clipboard-list':
		'M9 4.5h6a1 1 0 0 1 1 1V6h1.5A1.5 1.5 0 0 1 19 7.5v11A1.5 1.5 0 0 1 17.5 20h-11A1.5 1.5 0 0 1 5 18.5v-11A1.5 1.5 0 0 1 6.5 6H8v-.5a1 1 0 0 1 1-1Zm-1 6h8m-8 3.5h8m-8 3.5h5',
	truck: 'M3 7h11v8H3V7Zm11 3h4l3 3v2h-2m-5-5v5m-9 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm10 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z',
	cube: 'm12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 0v9m0 0-8-4.5M12 12l8-4.5',
	plus: 'M12 5v14M5 12h14',
	'chevron-left': 'm15 18-6-6 6-6',
	camera:
		'M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1-2h6l1 2h2.5A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z',
	circle: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
	logout: 'M9 4h4a1 1 0 0 1 1 1v2m-5 10H8a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1m0 7h9m0 0-3-3m3 3-3 3',
	trash: 'M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.7 12.1a1.5 1.5 0 0 1-1.5 1.4H8.2a1.5 1.5 0 0 1-1.5-1.4L6 7',
	search: 'm20 20-3.6-3.6M17 10.5A6.5 6.5 0 1 1 4 10.5a6.5 6.5 0 0 1 13 0Z',
	'check-circle': 'm8 12.5 2.5 2.5L16 9M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
	'alert-triangle':
		'M12 9v4m0 3.5h.01M10.4 4.6 3.5 17a1.5 1.5 0 0 0 1.3 2.2h14.4a1.5 1.5 0 0 0 1.3-2.2L13.6 4.6a1.5 1.5 0 0 0-2.6 0Z',
	inbox: 'M4 12h4l2 3h4l2-3h4M4 12v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-6M4 12l2-6.5A1 1 0 0 1 6.9 5h10.2a1 1 0 0 1 .9.9L20 12',
	desktop: 'M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 14.5v-9Z||M9 20h6m-3-4v4',
}

const path = computed(() => paths[props.name]?.split('||')[0] ?? paths.circle)
const path2 = computed(() => paths[props.name]?.split('||')[1])
</script>
