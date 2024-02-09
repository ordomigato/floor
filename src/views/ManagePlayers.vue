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
            <div class="add-player-container">
                <label>
                    <span>Player name</span>
                    <input
                        type="text"
                        v-model="playerName"
                    />
                </label>
                <button
                    @click="addPlayer"
                >
                    Add
                </button>
            </div>
            <div>
                <table>
                    <thead>
                        <tr>
                            <th>Player Name</th>
                            <th>Color</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="player in players" :key="player.id">
                            <td>{{ player.name }}</td>
                            <th class="player-color-container">
                                <span class="player-color" :style="`background-color: ${player.color};`"></span>
                                {{ player.color }}
                            </th>
                            <td>
                                <button
                                    @click="$router.push({ name: 'player-edit', params: {
                                        id: $route.params.id,
                                        playerId: player.id,
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
import type { IPlayer } from '@/types';
import { randomizeColor } from '@/utils/randomize-color';
import { addDoc, collection, getDocs, query } from 'firebase/firestore';
import { onMounted, ref, type Ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()

const playerName = ref('')

const players: Ref<IPlayer[]> = ref([])

const addPlayer = async () => {
    try {
        if (!auth.currentUser) {
            throw new Error("User not logged in")
        }

        if (!playerName.value) {
            throw new Error("please enter player name")
        }

        const gameId = route.params.id as string

        const playerCollection = collection(db, "games", gameId, "players")

        const player = {
            name: playerName.value,
            color: randomizeColor(),
        } 

        const p = await addDoc(playerCollection, player)

        players.value.push({
            id: p.id,
            ...player
        })
    } catch (e) {
        console.error(e)
    }
}

const getPlayers = async () => {
    try {
        if (!auth.currentUser) {
            throw new Error("User not logged in")
        }
        
        const playerCollection = collection(db, "games", route.params.id as string, "players")

        const q = query(playerCollection);

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            console.log(doc.data())
            players.value.push({
                id: doc.id,
                ...doc.data()
            } as IPlayer)
        });
    } catch (e) {
        console.error(e)
    }
}

onMounted(() => {
    getPlayers()
})
</script>
<style lang="scss" scoped>
.add-player-container {
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
