<template>
    <main>
        <div class="card">
            <button
                @click="$router.push({ name: 'game-edit', params: {id: $route.params.id}})"
            >
                Back to Game Overview
            </button>
        </div>
        <div class="card">
            <div class="add-category-container">
                <label>
                    <span>Category name</span>
                    <input
                        type="text"
                        v-model="catName"
                    />
                </label>
                <button
                    @click="addCategory"
                >
                    Add
                </button>
            </div>
            <div>
                <table>
                    <thead>
                        <tr>
                            <th>Category Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="cat in categories" :key="cat.id">
                            <td>{{ cat.name }}</td>
                            <td>
                                <button
                                    @click="$router.push({ name: 'category-edit', params: {
                                        id: $route.params.id,
                                        catId: cat.id,
                                    }})"
                                >
                                    Edit
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </main>
</template>
<script setup lang="ts">
import { auth, db } from '@/services/firebase';
import type { ICategory } from '@/types';
import { addDoc, collection, getDocs, query } from 'firebase/firestore';
import { onMounted, ref, type Ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()

const catName = ref('')

const categories: Ref<ICategory[]> = ref([])

const addCategory = async () => {
    try {
        if (!auth.currentUser) {
            throw new Error("User not logged in")
        }

        if (!catName.value) {
            throw new Error("please enter category name")
        }

        const gameId = route.params.id as string

        const catCollection = collection(db, "games", gameId, "categories")

        const cat = {
            name: catName.value,
        } 

        const c = await addDoc(catCollection, cat)

        categories.value.push({
            id: c.id,
            ...cat
        })
    } catch (e) {
        console.error(e)
    }
}

const getCategories = async () => {
    try {
        if (!auth.currentUser) {
            throw new Error("User not logged in")
        }
        
        const catCollection = collection(db, "games", route.params.id as string, "categories")

        const q = query(catCollection);

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            console.log(doc.data())
            categories.value.push({
                id: doc.id,
                ...doc.data()
            } as ICategory)
        });
    } catch (e) {
        console.error(e)
    }
}

onMounted(() => {
    getCategories()
})
</script>
<style lang="scss" scoped>
.add-category-container {
    display: flex;
    align-items: center;
    label {
        margin: 0;
        margin-right: 1rem;
    }
}

.player-color-container {
    .player-color {
        display: block;
        height: 1rem;
        width: 1rem;
    }
}
</style>
