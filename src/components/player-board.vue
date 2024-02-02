<template>
    <div class="player-board">
        <div class="players">
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
    </div>
</template>
<script setup lang="ts">
import { usePlayerStore } from "@/stores/playerStore"

const playerStore = usePlayerStore()

</script>
<style lang="scss" scoped>
.player-board {
    margin: 1rem;
    min-width: 250px;
    .players {
        background-color: var(--primary-color-light);
        box-shadow: 0 6px 12px rgba(0,0,0,0.1);
        padding: 2rem;
        border-radius: 4px;
        h2 {
            margin-top: 0;
        }
        .player {
            display: flex;
            margin-bottom: 0.5rem;
            .color {
                display: inline-block;
                width: 1rem;
                height: 1rem;
                margin-right: 0.5rem;
                border-radius: 20px;
            }
            p {
                margin: 0;
            }
        }
    }
}
</style>