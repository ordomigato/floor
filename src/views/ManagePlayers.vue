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
                            <th>Player Category</th>
                            <th>Color</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="player in players" :key="player.id">
                            <td>{{ player.name }}</td>
                            <td>
                                <select
                                    @change="(e) => setCategory(player, e)"
                                >
                                    <option>Select Category</option>
                                    <option
                                        v-for="cat in categories"
                                        :key="cat.id"
                                        :value="cat.id"
                                        :selected="cat.id === player.catId"
                                        :disabled="availableCat.has(cat.id)"
                                    >
                                        {{ cat.name }}
                                    </option>
                                </select>
                            </td>
                            <td class="player-color-container">
                                <span class="player-color" :style="`background-color: ${player.color};`"></span>
                                {{ player.color }}
                            </td>
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
import type { ICategory, IPlayer } from '@/types';
import { randomizeColor } from '@/utils/randomize-color';
import { addDoc, collection, doc, getDocs, query, setDoc } from 'firebase/firestore';
import { computed, onMounted, ref, type ComputedRef, type Ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()

const playerName = ref('')

const players: Ref<IPlayer[]> = ref([])

const categories: Ref<ICategory[]> = ref([])

const availableCat: ComputedRef<Set<string>> = computed(() => {
    const usedCats: string[] = players.value.reduce((acc: string[], val) => {
        if (val.catId) {
            acc.push(val.catId)
            return acc
        }
        return acc
    }, [] as string[])
    const usedCatsSet = new Set(usedCats)
    // const resp: ICategory[] = categories.value.filter(c => {
    //     if (!usedCatsSet.has(c.id)) {
    //         return c
    //     }
    //     return
    // })
    return usedCatsSet
})

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
            ...player,
            catId: ''
        })
    } catch (e) {
        console.error(e)
    }
}

const setCategory = async (player: IPlayer, e: any) => {
    try {
        if (!auth.currentUser) {
            throw new Error("User not logged in")
        }

        const catId = e.target.value

        const playerRef = doc(db, "games", route.params.id as string, "players", player.id)

        const payload: IPlayer = {
            ...player,
            catId,
        }

        setDoc(playerRef, payload)

        players.value = players.value.map(p => {
            if (p.id === player.id) {
                return payload
            } else {
                return p
            }
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
            players.value.push({
                id: doc.id,
                ...doc.data()
            } as IPlayer)
        });
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
            categories.value.push({
                id: doc.id,
                ...doc.data()
            } as ICategory)
        });
    } catch (e) {
        console.error(e)
    }
}

onMounted(async() => {
    await getPlayers()
    await getCategories()
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
