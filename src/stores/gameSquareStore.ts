import { IBoardDisplay, type IGameSquare } from "@/types";
import { acceptHMRUpdate, defineStore } from "pinia";

export const useGameSquareStore = defineStore({
    id: 'square',
    state: () => ({
        squares: [] as IGameSquare[],
        selectedSquares: [] as IGameSquare[],
        displayType: IBoardDisplay.categories as IBoardDisplay,
        showAdjaceSquares: false,
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
        setSquare(squareId: string, payload: IGameSquare) {
            this.squares = this.squares.map(s => {
                if (s.id === squareId) {
                    return payload
                } else {
                    return s
                }
            })
        },
        setSelectedSquares(payload: IGameSquare[]) {
            this.selectedSquares = payload 
        },
        setDisplayType(payload: IBoardDisplay) {
            this.displayType = payload
        },
        setShowAdjaceSquares(payload: boolean) {
            this.showAdjaceSquares = payload
        }
    }
})

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useGameSquareStore, import.meta.hot))
  }