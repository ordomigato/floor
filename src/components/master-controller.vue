<template>
    <div class="controller">
        <nav
            class="ui-card"
            v-if="props.gameView === IGameViews.floor"
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
                        :value="IBoardDisplay.categories"
                    />
                    Categories
                </label>
                <label>
                    <input
                        name="board-display"
                        type="radio"
                        v-model="gameSquareStore.displayType"
                        :value="IBoardDisplay.players"
                    />
                    Player Names
                </label>
                <label>
                    <input
                        name="board-display"
                        type="radio"
                        v-model="gameSquareStore.displayType"
                        :value="IBoardDisplay.territories"
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
                    @click="$router.push({name: 'games'})"
                >
                    Quit Game
                </button>
            </div>
        </nav>
        <nav class="ui-card" v-if="props.gameView === IGameViews.battle">
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
import { IBoardDisplay, type IBattleData, IGameViews } from '@/types';
import { storeToRefs } from 'pinia';
import { useCategoryStore } from '@/stores/categoryStore';

const playerStore = usePlayerStore()
const gameSquareStore = useGameSquareStore()
const categoryStore = useCategoryStore()

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

const selectPlayerRandomly = () => {
    onClearBattleData()
    const shuffle = 20
    let shuffleNumber = 0
    while (shuffleNumber < shuffle) {
        shuffleNumber++
        setTimeout(() => {
            const max = playerStore.players.length
            const index = Math.floor(Math.random() * max)
            playerStore.setSelectedPlayer(playerStore.players[index].id)
        }, (150 * shuffleNumber))
    }
    setTimeout(() => {
        gameSquareStore.setShowAdjaceSquares(true)

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
    gameSquareStore.setShowAdjaceSquares(false)
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