<template>
    <div class="controller">
        <nav
            class="ui-card"
            v-if="props.gameView === 'floor'"
        >
            <button
                class="w-100"
                @click="selectPlayerRandomly"
            >
                Randomizer
            </button>
            <div>
                <h3>Board Display</h3>
                <label>
                    <input
                        name="board-display"
                        type="radio"
                        v-model="gameSquareStore.displayType"
                        value="categories"
                    />
                    Categories
                </label>
                <label>
                    <input
                        name="board-display"
                        type="radio"
                        v-model="gameSquareStore.displayType"
                        value="players"
                    />
                    Player Names
                </label>
                <label>
                    <input
                        name="board-display"
                        type="radio"
                        v-model="gameSquareStore.displayType"
                        value="territories"
                    />
                    Territories
                </label>
            </div>
            <div class="battle-data">
                <h3>Challenge Data</h3>
                <p>Player A: <strong>{{ getPlayer(props.battleInfo.playerAId)?.name }}</strong></p>
                <p>Player B: <strong>{{ getPlayer(props.battleInfo.playerBId)?.name }}</strong></p>
                <p>Category: <strong>{{ getCategory(props.battleInfo.categoryId)?.name }}</strong></p>
                <button
                    v-if="isBattleReady"
                    class="w-100"
                    @click="onAcceptChallenge"
                >
                    Accept Challenge
                </button>
                <button
                    class="w-100"
                    @click="onClearBattleData"
                >
                    Clear Challenge Data
                </button>
            </div>
            <div class="mt-auto">
                <button
                    class="w-100"
                    v-if="gameSquareStore.squares.length && isShuffleable"
                    @click="shufflePlayers"
                >
                    Shuffle Players
                </button>
                <button
                    class="w-100"
                    @click="$router.push({name: 'games'})"
                >
                    Quit Game
                </button>
            </div>
        </nav>
        <nav class="ui-card" v-if="props.gameView === 'battle'">
            <button
                class="w-100"
                @click="onCancelBattle"
            >
                Cancel Challenge
            </button>
        </nav>
    </div>
</template>
<script setup lang="ts">
import { usePlayerStore } from '@/stores/playerStore'
import { useGameSquareStore } from '@/stores/gameSquareStore';
import type { IBattleData, IGameSquare, IGameViews } from '@/types';
import { storeToRefs } from 'pinia';
import { useCategoryStore } from '@/stores/categoryStore';
import { shuffle } from '@/utils/shuffle';
import { saveGame } from '@/services/game';
import { useRoute } from 'vue-router';
import { computed, type ComputedRef } from 'vue';

const playerStore = usePlayerStore()
const gameSquareStore = useGameSquareStore()
const categoryStore = useCategoryStore()
const route = useRoute()

const { getPlayer } = storeToRefs(playerStore)
const { getCategory } = storeToRefs(categoryStore)

const props = defineProps({
    battleInfo: {
        type: Object as () => IBattleData,
        required: true,
    },
    isBattleReady: {
        type: Boolean,
        required: true,
    },
    gameView: {
        type: String as () => IGameViews,
        required: true,
    }
})

const emit = defineEmits(['confirmChallenge', 'cancelBattle'])

const isShuffleable: ComputedRef<boolean> = computed(() => {
    // if any square has the same category as another, the game has already started.
    const categories = new Set()
    let returnedValue = true
    gameSquareStore.squares.forEach(s => {
        if (categories.has(s.categoryId)) {
            returnedValue = false
        } else {
            categories.add(s.categoryId)
        }
    })
    return returnedValue
})

const shufflePlayers = async () => {
    const playerCount = playerStore.players.length
    const sqrt = Math.sqrt(playerCount)

    const shuffledPlayers = shuffle(playerStore.players)

    const gameSquareData: IGameSquare[] = shuffledPlayers.map((p, i) => {
        const col = Math.floor((i % sqrt)) + 1
        const row = (Math.floor(i/sqrt)) + 1
        return {
            id: `${row}-${col}`,
            row: row,
            col: col,
            playerId: p.id,
            categoryId: p.catId,
        }
    })

    await saveGame(route.params.id as string, {
        board: gameSquareData
    })

    gameSquareStore.setSquares(gameSquareData)
}

const selectPlayerRandomly = () => {
    onClearBattleData()
    const shuffle = 20
    let shuffleNumber = 0

    // map of players ids and number of instances
    const playerMap: Map<string, number> = new Map()

    gameSquareStore.squares.map(s => {
        const val = playerMap.get(s.playerId)
        playerMap.set(s.playerId, val ? val + 1 : 1)
    })

    let playerPoolSet: Set<string> = new Set()
    
    playerMap.forEach((val, key) => {
        if (val === 1) {
            playerPoolSet.add(key)
        }
    })

    if (playerPoolSet.size === 0) {
        playerMap.forEach((val, key) => {
            playerPoolSet.add(key)
        })
    }

    const playerPool = [...playerPoolSet]
    while (shuffleNumber < shuffle) {
        shuffleNumber++
        setTimeout(() => {
            const max = playerPool.length
            const index = Math.floor(Math.random() * max)
            playerStore.setSelectedPlayer(playerPool[index])
        }, (150 * shuffleNumber))
    }
    setTimeout(() => {
        gameSquareStore.setShowAdjacentSquares(true)

    }, 170 * shuffle)
    // console.log('')
}

const onAcceptChallenge = () => {
    emit('confirmChallenge', props.battleInfo)
}

const onCancelBattle = () => {
    emit('cancelBattle')
}

const onClearBattleData = () => {
    gameSquareStore.setShowAdjacentSquares(false)
    playerStore.setSelectedPlayer('')
    playerStore.setSelectedChallenger('')
    categoryStore.setSelectedCategory('')
}

</script>
<style lang="scss" scoped>
.controller {
    padding: 1rem;
    min-width: 250px;
    h3 {
        margin-bottom: 0.5rem;
    }
    p {
        margin: 0;
    }
    label {
        display: flex;
        flex-direction: row;
        align-items: center;
    }
    .battle-data {
        button {
            margin-top: 1rem;
        }
    }
    nav {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
}
</style>