import { IBoardDisplay, type IGameSquare } from "@/types";
import { acceptHMRUpdate, defineStore } from "pinia";

export const useGameSquareStore = defineStore({
    id: 'square',
    state: () => ({
        squares: [] as IGameSquare[],
        selectedSquares: [] as IGameSquare[],
        displayType: IBoardDisplay.categories as IBoardDisplay,
        showAdjecentSquares: true,
        adjacentSquares: new Set()
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
            this.setAdjacentSquares(payload)
        },
        setAdjacentSquares(payload: IGameSquare[]) {
            this.clearAdjacentSquares()
            payload.map(s => {
                const top = `${s.row - 1}-${s.col}`
                const bottom = `${s.row + 1}-${s.col}`
                const left = `${s.row}-${s.col - 1}`
                const right = `${s.row}-${s.col + 1}`

                this.adjacentSquares.add(top)
                this.adjacentSquares.add(bottom)
                this.adjacentSquares.add(left)
                this.adjacentSquares.add(right)
            })
        },
        clearAdjacentSquares() {
            this.adjacentSquares = new Set()
        },
        setDisplayType(payload: IBoardDisplay) {
            this.displayType = payload
        },
        setShowAdjacentSquares(payload: boolean) {
            this.showAdjecentSquares = payload
        }
    }
})

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useGameSquareStore, import.meta.hot))
  }