export interface IGameSquare {
    id: string,
    name: string,
    row: number,
    col: number,
    playerId: string,
    questions: [],
}

export interface IPlayer {
    id: string,
    name: string,
    color: string,
}