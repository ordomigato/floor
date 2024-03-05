<template>
    <div
        :class="`
            square
            ${isSelected && 'selected'}
            ${isAdjacentSquare && 'adjacent'}
        `"
        :data-row="squareData.row"
        :data-col="squareData.col"
        :style="`background-color: ${backgroundColor}`"
        @click="togglePlayerModal"
    >
        <p
            v-if="squareStore.displayType === IBoardDisplay.categories"
        >
            {{ getCategory(squareData.categoryId)?.name }}
        </p>
        <p
            v-if="
                squareStore.displayType === IBoardDisplay.players
                || squareStore.displayType === IBoardDisplay.territories    
            "
        >
            {{ getPlayer(squareData.playerId)?.name }}
        </p>
    </div>
    <ModalPopup
        class="popup"
        v-if="playerModal"
    >
        <div>

            <select @change="updateSquare">
                <option
                    v-for="player in playerStore.players"
                    :key="player.id"
                    :selected="player.id === squareData.playerId"
                    :value="player.id"
                >
                    {{ player.name }}
                </option>
            </select>
            <p>
                {{ getCategory(squareData.categoryId)?.name }}
            </p>
            <footer>
                <button
                    @click="togglePlayerModal"
                >
                    Cancel
                </button>
                <button
                    @click="setSelectedChallenger"
                >
                    Select
                </button>
            </footer>
        </div>
    </ModalPopup>
</template>
<script lang="ts" setup>
import { IBoardDisplay, type IGameSquare } from '@/types';
import { usePlayerStore } from '@/stores/playerStore'
import { useGameSquareStore } from '@/stores/gameSquareStore'
import { computed, ref, type ComputedRef } from 'vue';
import { storeToRefs } from 'pinia';
import { useCategoryStore } from '@/stores/categoryStore';
import ModalPopup from './modal-popup.vue';
import { saveGame } from '@/services/game';
import { useRoute } from 'vue-router';

const playerStore = usePlayerStore()
const squareStore = useGameSquareStore()
const categoryStore = useCategoryStore()

const { getPlayer } = storeToRefs(playerStore)
const { getCategory } = storeToRefs(categoryStore)

const route = useRoute()

const props = defineProps({
    squareData: {
        type: Object as () => IGameSquare,
        required: true
    }
})

const playerModal = ref(false)

const backgroundColor = computed(() => {
    if (squareStore.displayType === IBoardDisplay.territories) {
        return getPlayer.value(props.squareData.playerId)?.color
    }
    // if (isSelected.value) {
    //     return getPlayer.value(playerStore.selectedPlayer)?.color
    // }
    return ''
})

const isSelected = computed(() => {
    return playerStore.selectedPlayer === props.squareData.playerId
})

const isAdjacentSquare: ComputedRef<boolean> = computed(() => {
    if (squareStore.showAdjecentSquares) {
        return squareStore.adjacentSquares.has(props.squareData.id)
    } else {
        return false
    }
})

const setSelectedChallenger = () => {
    if (playerStore.selectedPlayer) {
        playerStore.setSelectedChallenger(props.squareData.playerId)
        categoryStore.setSelectedCategory(props.squareData.categoryId)
    } else {
        playerStore.setSelectedPlayer(props.squareData.playerId)
        squareStore.setShowAdjacentSquares(true)
    }
    togglePlayerModal()
}

const updateSquare = async (e: Event) => {
    const target = e.target as HTMLSelectElement
    try {
        const player = playerStore.getPlayer(target!.value)
        if (!player) {
            throw new Error("player not found")
        }
        // update square locally
        squareStore.setSquare(props.squareData.id, {
            ...props.squareData,
            playerId: player.id,
            categoryId: player.catId,
        })
        // update board in db
        await saveGame(route.params.id as string, {
            board: squareStore.squares
        })
    } catch (e) {
        console.error(e)
    }
}

const togglePlayerModal = () => {
    playerModal.value = !playerModal.value
}

</script>
<style lang="scss" scoped>
.square {
    width: 100px;
    height: 100px;
    color: white;
    background-color: var(--primary-color-dark);
    border: 5px solid var(--primary-color-dark);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    transition: all 0.3s linear;
    &:hover {
        color: #333;
        cursor: pointer;
        background-color: var(--yellow-color);
        border: 5px solid var(--primary-color)
    }
    &.selected {
        background-color: var(--yellow-color);
        color: #333;
        transition: all 0.1s linear;
    }
    &.adjacent:not(.selected) {
        background-color: #dc2626;
    }
}

.popup {
    footer {
        display: flex;
        gap: 0.5rem;
        button {
            width: 100%;
        }
    }
}
</style>