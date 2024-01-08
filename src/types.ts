export interface IGameSquare {
    id: string,
    row: number,
    col: number,
    playerId: string,
    categoryId: string,
}

export interface ICategories {
    id: string,
    name: string,
    questions: [],
}

export interface IPlayer {
    id: string,
    name: string,
    color: string,
}

export enum IBoardDisplay {
    categories = 'categories',
    players = 'players',
    territories = 'territories'
}

export interface IBattleData {
    playerAId: string,
    playerBId: string,
    categoryId: string
}

export enum IGameViews {
    floor = 'floor',
    battle = 'battle'
}