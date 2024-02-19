
<template>
    <main>
        <MasterController
            :isBattleReady="isBattleReady"
            :battleInfo="battle"
            :gameView="view"
            @confirmChallenge="handleConfirmChallenge"
            @cancelBattle="handleCancelBatlle"
        />
        <GameBoard v-if="view === IGameViews.floor" />
        <BattleBoard
            v-if="view === IGameViews.battle"
            @complete="handleCancelBatlle"
        />
        <ModalPopup v-if="confirmChallengeModal">
            <ChallengeInfo
                :battleInfo="battle"
                @cancel="handleChallangeModalCancel"
                @begin="beginChallenge"
            />
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
import { IGameViews, type IBattleData, type ICategory, type IPlayer, type IGame } from '@/types';
import PlayerBoard from '@/components/player-board.vue';
import { useCategoryStore } from '@/stores/categoryStore';
import BattleBoard from '@/components/battle-board.vue';
import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import { useRoute } from 'vue-router';

const defaultBattle: IBattleData = {
    playerAId: '',
    playerBId: '',
    categoryId: '',
}

const squareStore = useGameSquareStore()
const playerStore = usePlayerStore()
const categoryStore = useCategoryStore()

const route = useRoute()

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
        try {
        if (!auth.currentUser) {
            throw new Error("User not logged in")
        }
        const gameRef = collection(db, "games", route.params.id as string, 'players');

        const gameSnap = await getDocs(gameRef);

        const players: IPlayer[] = []

        gameSnap.forEach((doc) => {
            players.push({
                id: doc.id,
                ...doc.data()
            } as IPlayer)
        });

        playerStore.setPlayers(players)
    } catch (e) {
        console.error(e)
    }   

    } catch (e) {
        if (e instanceof Error) {
            error.value = e.message
        }
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

        const categories: ICategory[] = []

        querySnapshot.forEach((doc) => {
            categories.push({
                ...doc.data() as ICategory,
                id: doc.id
            })
        });

        categoryStore.setCategories(categories)
    } catch (e) {
        console.error(e)
    }
}

const getGame = async () => {
    try {
        if (!auth.currentUser) {
            throw new Error("User not logged in")
        }

        const gameSnapshot: IGame = await getDoc(doc(db, "games", route.params.id as string))
            .then(resp => resp.data() as IGame)

        if (!gameSnapshot.save?.board) {
            throw new Error("Error loading game board")
        }

        squareStore.setSquares(gameSnapshot.save.board)
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

const handleChallangeModalCancel = () => {
    confirmChallengeModal.value = false
}

const beginChallenge = () => {
    handleChallangeModalCancel()
    view.value = IGameViews.battle
}

const handleCancelBatlle = () => {
    view.value = IGameViews.floor
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
    await getCategories()
    await getGame()
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