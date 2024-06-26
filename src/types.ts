export interface IGameSquare {
    id: string,
    row: number,
    col: number,
    playerId: string,
    categoryId: string,
}

export interface ICategory {
    id: string,
    name: string,
    order: string[],
}

export interface IPlayer {
    id: string,
    name: string,
    color: string,
    catId: string,
}

export enum IBoardDisplay {
    categories = 'categories',
    players = 'players',
    territories = 'territories',
}

export interface IBattleData {
    playerAId: string,
    playerBId: string,
    categoryId: string,
}

export enum IGameViews {
    floor = 'floor',
    battle = 'battle',
}

export interface IGameSaveState {
    board: IGameSquare[],
}

export interface IGame {
    id: string,
    name: string,
    owner_id: string,
    save?: IGameSaveState,
}

export interface IQuestion {
    id: string,
    answer: string,
    imgUrl: string,
    img?: HTMLImageElement,
}

export interface IAddQuestionRequest {
    answer: string,
    imgUrl: string,
}
