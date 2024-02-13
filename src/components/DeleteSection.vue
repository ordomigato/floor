<template>
    <div>
        <h2>Danger Zone</h2>
        <label>
            <span>Type "delete" to confirm</span>
            <input type="text" v-model="confirmDelete" placeholder="delete" />
        </label>
        <p v-if="error">{{ error }}</p>
        <button
            @click="emitDelete"
            :disabled="confirmDelete !== 'delete'"
        >
            Delete {{ props.text }}
        </button>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
    text: {
        type: String,
        default: '',
    }
})

const emit = defineEmits(['delete'])

const confirmDelete = ref('')
const error = ref('')

const emitDelete = () => {
    try {
        if (confirmDelete.value !== 'delete') {
            throw new Error('Type "delete" to confirm')
        }

        emit('delete')
    } catch (e) {
        if (e instanceof Error) {
            error.value = e.message
        }
        console.error(e)
    }

}
</script>
