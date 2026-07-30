<template>
	<div>
		<select
			v-if="!creating"
			:value="modelValue"
			class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
			@change="onSelect"
		>
			<option value="" disabled>{{ placeholder }}</option>
			<option v-for="opt in options" :key="opt.name" :value="opt.name">{{ opt.name }}</option>
			<option value="__create__">+ Create new {{ placeholder.toLowerCase() }}</option>
		</select>

		<div v-else class="flex gap-2">
			<input
				v-model="newValue"
				type="text"
				:placeholder="`New ${placeholder.toLowerCase()}`"
				class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
			/>
			<AppButton size="sm" :disabled="!newValue" :loading="busy" @click="create">Add</AppButton>
			<AppButton size="sm" variant="secondary" @click="creating = false">Cancel</AppButton>
		</div>
		<p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import { insertDoc } from '../utils/frappeApi'
import AppButton from './AppButton.vue'

const props = defineProps({
	modelValue: String,
	options: { type: Array, default: () => [] },
	placeholder: { type: String, default: 'Select' },
	doctype: { type: String, required: true },
	nameField: { type: String, required: true },
	extraFields: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:modelValue', 'created'])

const creating = ref(false)
const newValue = ref('')
const busy = ref(false)
const error = ref('')

function onSelect(e) {
	const value = e.target.value
	if (value === '__create__') {
		creating.value = true
		newValue.value = ''
		return
	}
	emit('update:modelValue', value)
}

async function create() {
	error.value = ''
	busy.value = true
	try {
		const doc = await insertDoc({
			doctype: props.doctype,
			[props.nameField]: newValue.value,
			...props.extraFields,
		})
		creating.value = false
		emit('created', doc)
		emit('update:modelValue', doc.name)
	} catch (e) {
		error.value = e.messages?.[0] || e.message || 'Failed to create.'
	} finally {
		busy.value = false
	}
}
</script>
