<template>
    <main>
        <div class="card">
            <button
                @click="$router.push({ name: 'game-categories', params: {id: $route.params.id}})"
            >
                Back to Categories
            </button>
        </div>
        <div class="card">
            <button
                @click="deleteCategory"
            >
                Delete Category
            </button>
        </div>
    </main>
</template>

<script setup lang="ts">
import { auth, db } from '@/services/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute()
const router = useRouter()

const deleteCategory = async () => {
    try {
        if (!auth.currentUser) {
            throw new Error("User not logged in")
        }

        const catRef = doc(db, "games", route.params.id as string, "categories", route.params.catId as string)

        await deleteDoc(catRef);

        router.push({ name: 'game-categories', params: { id: route.params.id } })
    } catch (e) {
        console.error(e)
    }
}
</script>

<style scoped>

</style>