<template>
    <div>
        <h2>Category Info</h2>
        <label>
            <span>Name</span>
            <input
                type="text"
                v-model="catName"
            />
        </label>
        <button
            @click="handleUpdateCategory"
            :disabled="catName === props.category.name"
        >
            Save
        </button>
    </div>
</template>
<script setup lang="ts">
import { updateCategory } from '@/services/game';
import type { ICategory } from '@/types';
import { ref, type PropType, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()

const props = defineProps({
    category: {
        type: Object as PropType<ICategory>,
        required: true,
    }
})

const emit = defineEmits(['onUpdate'])

const catName = ref('')

const handleUpdateCategory = async () => {
    try {
        if (!props.category.name) {
            throw new Error('Category name cannot be blank')
        }

        const newName = catName.value

        await updateCategory(
            route.params.id as string,
            route.params.catId as string,
            {
                name: newName
            }
        )

        emit('onUpdate', {
            ...props.category,
            name: newName,
        })
    } catch (e) {
        console.error(e)
    }
}

onMounted(() => {
    catName.value = props.category.name
})
</script>
