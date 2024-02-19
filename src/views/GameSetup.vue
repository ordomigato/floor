<template>
    <main>
        <div class="card">
            <h2>Game Setup</h2>
            <p>Before beginning your game, please review the list of players.</p>
            <div>
                <h3>Players (Total: {{ players.length }})</h3>
                <ul>
                    <li
                        v-for="player in players"
                        :key="player.id"
                    >
                        <span>{{ player.name }}</span> - 
                        <span>({{ getPlayerCategory(player.catId) }})</span>
                    </li>
                </ul>
            </div>
            <hr />
            <footer>
                <p>Once a game has been started, no other players can be added. Categories and questions can still be edited.</p>
                <button
                    @click="$router.push({name: 'games'})"
                >
                    Cancel
                </button>
                <button
                    :disabled="!isReady"
                    @click="createGame"
                >
                    Start Game
                </button>
            </footer>
        </div>
    </main>
</template>
<script setup lang="ts">
import { auth, db } from '@/services/firebase';
import { useCategoryStore } from '@/stores/categoryStore';
import type { ICategory, IGameSquare, IPlayer } from '@/types';
import { shuffle } from '@/utils/shuffle';
import { collection, doc, getDocs, query, updateDoc } from 'firebase/firestore';
import { onMounted, ref, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const categoryStore = useCategoryStore()

const route = useRoute()
const router = useRouter()

const players: Ref<IPlayer[]> = ref([])
const categories: Ref<ICategory[]> = ref([])
const isReady = ref(true)

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
            console.log(doc.data())
            categories.value.push({
                id: doc.id,
                ...doc.data()
            } as ICategory)
        });

        categoryStore.setCategories(categories.value)
    } catch (e) {
        console.error(e)
    }
}

const getPlayerCategory = (catId: string): string => {
    const cat = categoryStore.getCategory(catId)?.name
    if (cat) {
        return cat
    } else {
        // isReady.value = false
        return ''
    }
}

const createGame = () => {
    try {
        // Step 1: shuffle players
        // Step 2: create square data based on players and their categories
        // step 3: save to db
        const playerCount = players.value.length
        const sqrt = Math.sqrt(playerCount)

        const shuffledPlayers = shuffle(players.value)

        const gameSquareData: IGameSquare[] = shuffledPlayers.map((p, i) => {
            const col = (i % sqrt) + 1
            const row = (Math.floor(i/sqrt)) + 1
            return {
                id: `${row}-${col}`,
                row: row,
                col: col,
                playerId: p.id,
                categoryId: p.catId,
            }
        })

        const gameRef = doc(db, "games", route.params.id as string)

        updateDoc(gameRef, {
            save: {
                board: gameSquareData,
            }
        })

        router.push({ name: 'game-start', params: { id: route.params.id }})
    } catch (e) {
        console.error(e)
    }
}

onMounted( async () => {
    await getPlayers()
    await getCategories()
})

</script>
