<template>
    <div class="player-board">
        <h2>Players</h2>
        <div
            class="player"
            v-for="player in playerStore.players"
            :key="player.id"
        >
            <span class="color" :style="`background-color: ${player.color};`"></span>
            <p>{{ player.name }}</p>
        </div>
    </div>
</template>
<script setup lang="ts">
import { usePlayerStore } from "@/stores/playerStore"

const playerStore = usePlayerStore()

</script>
<style lang="scss" scoped>
.player-board {
    margin: 1rem;
    .player {
        display: flex;
        margin-bottom: 0.5rem;
        .color {
            display: inline-block;
            width: 1rem;
            height: 1rem;
            margin-right: 0.5rem;
        }
        p {
            margin: 0;
        }
    }
}
</style>