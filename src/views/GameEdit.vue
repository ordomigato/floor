<template>
    <main>
        <div class="card">
            <button @click="$router.push({ name: 'games' })">
                Back to Games List
            </button>
        </div>
        <div class="card">
            <h2>Edit Game</h2>
            <button @click="$router.push({
                name: 'game-players',
                params: {
                    id: $route.params.id
                }
            })">
                Players
            </button>
            <button @click="$router.push({
                name: 'game-categories',
                params: {
                    id: $route.params.id
                }
            })">
                Categories
            </button>
        </div>
        <div class="card">
            <button
                @click="deleteGame"
            >
                Delete Game
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

const deleteGame = async () => {
    try {
        if (!auth.currentUser) {
            throw new Error("User not logged in")
        }

        await deleteDoc(doc(db, "games", route.params.id as string));

        router.push({ name: 'games' })
    } catch (e) {
        console.error(e)
    }
}
</script>
