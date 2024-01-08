import type { IPlayer } from "@/types";
import { acceptHMRUpdate, defineStore } from "pinia";
import { useGameSquareStore } from "./gameSquareStore";

const squareStore = useGameSquareStore()

export const usePlayerStore = defineStore({
    id: 'player',
    state: () => ({
        players: [] as IPlayer[],
        selectedPlayer: '', // the player's id
        selectedChallenger: '', // the player's id
    }),
    getters: {
        data: (state) => state,
        getPlayer: (state) => {
            return (playerId: string): IPlayer | undefined => state.players.find(s => s.id === playerId)
        }
    },
    actions: {
        setPlayers(payload: IPlayer[]) {
            this.players = payload 
        },
        setSelectedPlayer(payload: string) {
            this.selectedPlayer = payload
            const ownedSquares = squareStore.squares.filter((s) => {
                if (s.playerId === payload) {
                    return s
                }
            })
            squareStore.setSelectedSquares(ownedSquares)
        },
        setSelectedChallenger(payload: string) {
            this.selectedChallenger = payload
        }
    }
})

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(usePlayerStore, import.meta.hot))
  }