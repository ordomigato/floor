<template>
    <div
        :class="`
            square
            ${isSelected && 'selected'}
            ${isAdjacentSquare && 'adjacent'}
        `"
        :style="
            `background-color: ${backgroundColor}`
        "
        @click="setSelectedChallenger"
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
</template>
<script lang="ts" setup>
import { IBoardDisplay, type IGameSquare } from '@/types';
import { usePlayerStore } from '@/stores/playerStore'
import { useGameSquareStore } from '@/stores/gameSquareStore'
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useCategoryStore } from '@/stores/categoryStore';

const playerStore = usePlayerStore()
const squareStore = useGameSquareStore()
const categoryStore = useCategoryStore()

const { getSquare } = storeToRefs(squareStore)
const { getPlayer } = storeToRefs(playerStore)
const { getCategory } = storeToRefs(categoryStore)

const props = defineProps({
    squareData: {
        type: Object as () => IGameSquare,
        required: true
    }
})

const backgroundColor = computed(() => {
    if (squareStore.displayType === IBoardDisplay.territories) {
        return getPlayer.value(props.squareData.playerId)?.color
    }
    if (isSelected.value) {
        return getPlayer.value(playerStore.selectedPlayer)?.color
    }
    return ''
})

const isSelected = computed(() => {
    return playerStore.selectedPlayer === props.squareData.playerId
})

const isAdjacentSquare = computed(() => {
    if (!isSelected.value) {
        const adjacentSquares = getAdjacentSquares(
            props.squareData.row,
            props.squareData.col
        )
        return adjacentSquares.some(as => squareStore.selectedSquares.some(ss => ss.id === as))
    }
    return false;
})

const getAdjacentSquares = (row: number, col: number): (string)[] => {
    const adjacentSquares: Set<string | undefined> = new Set()
    // plus 1 to row
    adjacentSquares.add(getSquare.value(`${row + 1}-${col}`)?.id)
    // minus 1 to row
    adjacentSquares.add(getSquare.value(`${row - 1}-${col}`)?.id)
    // plus 1 to col
    adjacentSquares.add(getSquare.value(`${row}-${col + 1}`)?.id)
    // plus 1 to row
    adjacentSquares.add(getSquare.value(`${row}-${col - 1}`)?.id)
    const filteredData = [...adjacentSquares].filter( s => s ) as string[]
    return filteredData;
}

const setSelectedChallenger = () => {
    if (playerStore.selectedPlayer) {
        playerStore.setSelectedChallenger(props.squareData.playerId)
        categoryStore.setSelectedCategory(props.squareData.categoryId)
    } else {
        playerStore.setSelectedPlayer(props.squareData.playerId)
    }
}

</script>
<style lang="scss" scoped>
.square {
    --main-color: navy;
    width: 100px;
    height: 100px;
    color: white;
    background-color: var(--main-color);
    border: 5px solid var(--main-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    &:hover {
        color: #333;
        cursor: pointer;
        background-color: orange;
        border: 5px solid var(--main-color)
    }
    &.selected {
        background-color: yellow;
        color: #333
    }
    &.adjacent {
        background-color: red;
    }
}
</style>