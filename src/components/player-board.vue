<template>
    <div class="player-board">
        <div class="ui-card players">
            <h2>Players</h2>
            <div
                v-for="player in players"
                :key="player.id"
                :class="`player ${activePlayers.includes(player.id) ? '' : 'inactive'}`"
            >
                <span class="color" :style="`background-color: ${player.color};`"></span>
                <p>{{ player.name }}</p>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useGameSquareStore } from "@/stores/gameSquareStore";
import { usePlayerStore } from "@/stores/playerStore"
import type { IPlayer } from "@/types";
import { computed, type ComputedRef } from "vue";

const playerStore = usePlayerStore()
const squareStore = useGameSquareStore()

const players: ComputedRef<IPlayer[]> = computed(() => {
    return playerStore.players
})

const activePlayers: ComputedRef<string[]> = computed(() => {
    const players: Set<string> = new Set([])

    squareStore.squares.forEach((s) => {
        if (s.playerId) {
            const player = playerStore.getPlayer(s.playerId)
            if (player) {
                players.add(player.id)
            }
        }
    })

    return [...players]
})
</script>
<style lang="scss" scoped>
.player-board {
    margin: 1rem;
    min-width: 250px;
    max-height: 100vh;
    .players {
        h2 {
            margin-top: 0;
        }
        .player {
            display: flex;
            margin-bottom: 0.5rem;
            &.inactive {
                opacity: 0.5;
            }
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