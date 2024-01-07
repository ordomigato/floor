<template>
    <div class="board">
        <div
            class="row"
            v-for="(s, i) in gameSquares.size"
            :key="i"
        >
            <GameSquare
                :cat="squareData"
                v-for="squareData in gameSquares.get(s)"
                :key="squareData.id"
            />
        </div>
    </div>
</template>
<script lang="ts" setup>
import GameSquare from '@/components/game-square.vue'
import type { IGameSquare } from '@/types';
import { type ComputedRef, computed } from 'vue';
import { useGameSquareStore } from '@/stores/gameSquareStore'

const squareStore = useGameSquareStore()

const gameSquares: ComputedRef<Map<number, IGameSquare[]>> = computed(() => {
    const data: Map<number, IGameSquare[]> = new Map()

    squareStore.squares.forEach(v => {
        const currArray = data.get(v.row)
        const d = currArray ? [...currArray, v] : [v]
        data.set(v.row, d)
    })
    return data;
})

</script>
<style lang="scss" scoped>
.board {
    padding: 1rem;
    .row {
        display: flex;
        gap: 0.25rem;
        &:not(:last-of-type) {
            margin-bottom: 0.25rem;
        }
    }
}
</style>
