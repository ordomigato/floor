
<template>
    <main>
        <MasterController />
        <GameBoard />
        <PlayerBoard />
    </main>
</template>
<script lang="ts" setup>
import MasterController from '@/components/master-controller.vue'
import GameBoard from '@/components/game-board.vue';
import { onMounted, ref } from 'vue';
import { useGameSquareStore } from '@/stores/gameSquareStore'
import { usePlayerStore } from '@/stores/playerStore'
import type { IGameSquare, IPlayer } from '@/types';
import { randomizeColor } from '@/utils/randomize-color'
import PlayerBoard from '@/components/player-board.vue';

const squareStore = useGameSquareStore()
const playerStore = usePlayerStore()

const error = ref('');

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
        const gameSquareData: IGameSquare[] = data.map((c, i) => {
            const col = (i % sqrt) + 1
            const row = (Math.floor(i/sqrt)) + 1
            return {
                id: `${row}-${col}`,
                name: c.title,
                row: row,
                col: col,
                playerId: playerStore.players[i % playerStore.players.length].id,
                questions: [],
            }
        })
        squareStore.setSquares(gameSquareData)
        console.log(gameSquareData)
    } catch (e) {
        if (e instanceof Error) {
            error.value = e.message
        }
    }
}

onMounted(async () => {
    await getPlayers()
    await setupCategories()
})
</script>
<style lang="scss">
main {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    // align-items: center;
    // justify-content: center;
    min-height: 100vh;
}
</style>