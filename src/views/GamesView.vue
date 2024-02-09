<template>
    <main>
        <div class="card">
            <h2>Games Page</h2>
            <button
                @click="$router.push({ name: 'game-create' })"
            >
                Create Game
            </button>
            <div>
                <table>
                    <thead>
                        <tr>
                            <th align="left">
                                Name
                            </th>
                            <th align="right">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="game in games" :key="game.id">
                            <td>{{ game.name }}</td>
                            <td align="right">
                                <button
                                    @click="() => $router.push({
                                        name: 'game-edit',
                                        params: {
                                            id: game.id
                                        }
                                    })"
                                >
                                    Edit
                                </button>
                                <button
                                    @click="$router.push({ name: 'game-start', params: {id: game.id}})"
                                >
                                    Play
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="card">
            <button
                @click="handleLogout"
            >
                Logout
            </button>
        </div>
    </main>
</template>
<script setup lang="ts">
import { logout } from '@/services/auth';
import { onMounted, ref, type Ref } from 'vue';
import { collection, where, query, getDocs } from "firebase/firestore"; 
import { auth, db } from '@/services/firebase';
import type { IGame } from '@/types';

const handleLogout = async () => {
    logout()
}

const games: Ref<IGame[]> = ref([])

const getGames = async () => {
    try {
        if (!auth.currentUser) {
            throw new Error("User not logged in")
        }
        const q = query(collection(db, "games"), where("owner_id", "==", auth.currentUser.uid));

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            games.value.push({
                id: doc.id,
                ...doc.data()
            } as IGame)
        });
    } catch (e) {
        console.error(e)
    }
}

onMounted(() => {
    getGames()
})
</script>
