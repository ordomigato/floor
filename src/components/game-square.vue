<template>
    <div
        :class="`
            square
            ${isSelected && 'selected'}
            ${isAdjacentSquare && 'adjacent'}
        `"
        :style="`background-color: ${isSelected && getPlayer(playerStore.selectedPlayer)?.color}`"
    >
        {{ props.cat.id }}
    </div>
</template>
<script lang="ts" setup>
import type { IGameSquare } from '@/types';
import { usePlayerStore } from '@/stores/playerStore'
import { useGameSquareStore } from '@/stores/gameSquareStore'
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

const playerStore = usePlayerStore()
const squareStore = useGameSquareStore()

const { getSquare } = storeToRefs(squareStore)
const { getPlayer } = storeToRefs(playerStore)

const props = defineProps({
    cat: {
        type: Object as () => IGameSquare,
        required: true
    }
})

const isSelected = computed(() => {
    return playerStore.selectedPlayer === props.cat.playerId
})

const isAdjacentSquare = computed(() => {
    if (!isSelected.value) {
        const adjacentSquares = getAdjacentSquares(
            props.cat.row,
            props.cat.col
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
    align-items: center;
    justify-content: center;
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