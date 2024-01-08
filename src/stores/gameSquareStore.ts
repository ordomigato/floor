import { IBoardDisplay, type IGameSquare } from "@/types";
import { acceptHMRUpdate, defineStore } from "pinia";

export const useGameSquareStore = defineStore({
    id: 'square',
    state: () => ({
        squares: [] as IGameSquare[],
        selectedSquares: [] as IGameSquare[],
        displayType: IBoardDisplay.categories as IBoardDisplay,
    }),
    getters: {
        getSquare: (state) => {
            return (squareId: string): IGameSquare | undefined => state.squares.find(s => s.id === squareId)
        }
    },
    actions: {
        setSquares(payload: IGameSquare[]) {
            this.squares = payload 
        },
        setSelectedSquares(payload: IGameSquare[]) {
            this.selectedSquares = payload 
        },
        setDisplayType(payload: IBoardDisplay) {
            this.displayType = payload
        }
    }
})

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useGameSquareStore, import.meta.hot))
  }