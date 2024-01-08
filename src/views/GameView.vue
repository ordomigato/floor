
<template>
    <main>
        <MasterController
            :isBattleReady="isBattleReady"
            :battleInfo="battle"
            @confirmChallenge="handleConfirmChallenge"
        />
        <GameBoard v-if="view === IGameViews.floor" />
        <BattleBoard v-if="view === IGameViews.battle" />
        <ModalPopup v-if="confirmChallengeModal">
            <ChallengeInfo :battleInfo="battle" />
        </ModalPopup>
        <PlayerBoard />
    </main>
</template>
<script lang="ts" setup>
import MasterController from '@/components/master-controller.vue'
import GameBoard from '@/components/game-board.vue';
import ModalPopup from '@/components/modal-popup.vue'
import ChallengeInfo from '@/components/challenge-info.vue'
import { computed, onMounted, ref, type Ref } from 'vue';
import { useGameSquareStore } from '@/stores/gameSquareStore'
import { usePlayerStore } from '@/stores/playerStore'
import { IGameViews, type IBattleData, type ICategories, type IGameSquare, type IPlayer } from '@/types';
import { randomizeColor } from '@/utils/randomize-color'
import PlayerBoard from '@/components/player-board.vue';
import { useCategoryStore } from '@/stores/categoryStore';
import BattleBoard from '@/components/battle-board.vue';

const defaultBattle: IBattleData = {
    playerAId: '',
    playerBId: '',
    categoryId: '',
}

const squareStore = useGameSquareStore()
const playerStore = usePlayerStore()
const categoryStore = useCategoryStore()

const error = ref('');

const view: Ref<IGameViews> = ref(IGameViews.floor)
const confirmChallengeModal: Ref<boolean> = ref(false)
const battle: Ref<IBattleData> = ref(defaultBattle);

const isBattleReady = computed(() => {
    const { playerAId, playerBId, categoryId } = battle.value
    if (playerAId && playerBId && categoryId ) {
        return true
    }
    return false
})

const getPlayers = async () => {
    try {
        const resp = await fetch("https://jsonplaceholder.typicode.com/users")
            .then(resp => resp.json())

        const data = resp.slice(-49) as IPlayer[]

        const players: IPlayer[] = data.map(p => ({
            id: p.id,
            name: p.name,
            color: randomizeColor(),
        }))

        playerStore.setPlayers(players)
    } catch (e) {
        if (e instanceof Error) {
            error.value = e.message
        }
    }
}

const setupCategories = async () => {
    try {
        const resp: {
            completed: boolean,
            id: number,
            title: string,
            userId: number,
        }[] = await fetch("https://jsonplaceholder.typicode.com/todos")
            .then(resp => resp.json())

        const data = resp.slice(-49)
        const sqrt = Math.sqrt(data.length)
        // setup categories
        const categoriesData: ICategories[] = data.map((c) => {
            return {
                id: `${c.id}`,
                name: c.title,
                questions: []
            }
        })
        categoryStore.setCategories(categoriesData)
        // setup game squares
        const gameSquareData: IGameSquare[] = categoriesData.map((c, i) => {
            const col = (i % sqrt) + 1
            const row = (Math.floor(i/sqrt)) + 1
            return {
                id: `${row}-${col}`,
                row: row,
                col: col,
                playerId: playerStore.players[i % playerStore.players.length].id,
                categoryId: c.id,
            }
        })
        squareStore.setSquares(gameSquareData)
    } catch (e) {
        if (e instanceof Error) {
            error.value = e.message
        }
    }
}

const handleConfirmChallenge = (data: IBattleData) => {
    console.log(data) // not used right now - but maybe later
    confirmChallengeModal.value = true
}

playerStore.$subscribe((mutation, state) => {
    battle.value.playerAId = state.selectedPlayer
    battle.value.playerBId = state.selectedChallenger
})

categoryStore.$subscribe((mutation, state) => {
    battle.value.categoryId = state.selectedCategory
})

onMounted(async () => {
    await getPlayers()
    await setupCategories()
})
</script>
<style lang="scss">
main {
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    // align-items: center;
    // justify-content: center;
    min-height: 100vh;
}
</style>