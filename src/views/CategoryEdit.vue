<template>
    <main v-if="!loading">
        <div class="card">
            <button
                @click="$router.push({ name: 'game-categories', params: {id: $route.params.id}})"
            >
                Back to Categories
            </button>
        </div>
        <p v-if="error" class="error">{{ error.message }}</p>
        <div class="card" v-if="category">
            <CategorySettings
                :category="category"
                @onUpdate="onUpdateCategory"
            />
        </div>
        <div class="card">
            <QuestionsTable
                v-if="category"
                :questions="orderedQuestions"
                @onAddQuestion="onAddQuestion"
                @onDeleteQuestion="onDeleteQuestion"
                @onUpdateOrder="onUpdateOrder"
            />
        </div>
        <div class="card">
            <DeleteSection text="Category" @delete="deleteCategory" />
        </div>
    </main>
</template>

<script setup lang="ts">
import QuestionsTable from '@/components/question/QuestionsTable.vue'
import CategorySettings from '@/components/category/CategorySettings.vue'
import DeleteSection from '@/components/DeleteSection.vue';
import { auth, db } from '@/services/firebase';
import { getCategory, getQuestions } from '@/services/game';
import type { ICategory, IQuestion } from '@/types';
import { deleteDoc, doc } from 'firebase/firestore';
import { computed, onMounted, ref, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { orderQuestions } from '@/utils/order-questions';

const route = useRoute()
const router = useRouter()

const questions: Ref<IQuestion[]> = ref([])
const category: Ref<ICategory | null> = ref(null)

const error: Ref<Error | null> = ref(null)
const loading = ref(false)

const orderedQuestions = computed(() => {
    return orderQuestions(category.value?.order || [], questions.value)
})

const onUpdateOrder = (order: string[]) => {
    if (category.value) {
        category.value = {
            ...category.value,
            order,
        }
    }
}

const verifyPageData = () => {
    if (!auth.currentUser) {
        throw new Error("User not logged in")
    }
    if (!route.params.id) {
        throw new Error("Missing game ID")
    }
    if (!route.params.catId) {
        throw new Error("Missing category ID")
    }
}

const onUpdateCategory = (cat: ICategory) => {
    category.value = cat
}

const onAddQuestion = (question: IQuestion) => {
    questions.value.push(question)
}

const onDeleteQuestion = (qId: string) => {
    questions.value = questions.value.filter(q => q.id !== qId)
}

const handleGetQuestions = async () => {
    loading.value = true
    try {
        verifyPageData()

        const data = await getQuestions(
            route.params.id as string,
            route.params.catId as string
        )

        questions.value = data
    } catch (e) {
        if (e instanceof Error) {
            error.value = e
        } else {
            console.error(e)
        }
    } finally {
        loading.value = false
    }
}

const handleGetCategory = async () => {
    loading.value = true
    try {
        verifyPageData()

        const data = await getCategory(
            route.params.id as string,
            route.params.catId as string,
        )
        
        category.value = data
    } catch (e) {
        if (e instanceof Error) {
            error.value = e
        } else {
            console.error(e)
        }
    } finally {
        loading.value = false
    }
}

const deleteCategory = async () => {
    try {
        if (!auth.currentUser) {
            throw new Error("User not logged in")
        }

        const catRef = doc(db, "games", route.params.id as string, "categories", route.params.catId as string)

        await deleteDoc(catRef);

        router.push({ name: 'game-categories', params: { id: route.params.id } })
    } catch (e) {
        if (e instanceof Error) {
            error.value = e
        } else {
            console.error(e)
        }
    }
}

onMounted(async () => {
    await handleGetCategory()
    await handleGetQuestions()
})
</script>
