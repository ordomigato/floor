<template>
    <main>
        <div class="card">
            <button
                @click="deletePlayer"
            >
                Delete Player
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

const deletePlayer = async () => {
    try {
        if (!auth.currentUser) {
            throw new Error("User not logged in")
        }

        const playerRef = doc(db, "games", route.params.id as string, "players", route.params.playerId as string)

        await deleteDoc(playerRef);

        router.push({ name: 'game-players', params: { id: route.params.id } })
    } catch (e) {
        console.error(e)
    }
}
</script>

<style scoped>

</style>