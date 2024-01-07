<template>
    <div class="controller">
        <button
            class="w-100"
            @click="selectSquareRandomly"
        >
            Randomizer
        </button>
    </div>
</template>
<script setup lang="ts">
import { usePlayerStore } from '@/stores/playerStore'

const playerStore = usePlayerStore()

const selectSquareRandomly = () => {
    const max = playerStore.players.length
    const index = Math.floor(Math.random() * max)
    playerStore.setSelectedPlayer(playerStore.players[index].id)
    console.log(playerStore.players[index].id)
}
</script>
<style lang="scss" scoped>
.controller {
    padding: 1rem;
}
</style>