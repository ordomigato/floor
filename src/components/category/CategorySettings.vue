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
            @click="handleUpdateCategoryName"
            :disabled="catName === props.category.name"
        >
            Save
        </button>
    </div>
</template>
<script setup lang="ts">
import { updateCategoryName } from '@/services/game';
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

const handleUpdateCategoryName = async () => {
    try {
        if (!props.category.name) {
            throw new Error('Category name cannot be blank')
        }

        const newName = catName.value

        await updateCategoryName(
            route.params.id as string,
            route.params.catId as string,
            newName
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
