import { Vec2 } from 'cc'
import Board from '../components/board/Board'
import { Level } from '../components/level/Level'
import GameManager from '../components/manager/GameManager'
import SubTilePool from '../components/subtiles/SubTilePool'
import { SubType, Theme, Turn } from './global'

export namespace TileConnect {
    /*Base Tile Interface*/
    export interface ITile {
        addOnClickCallback(callback: (tile: ITile) => void): void
        emitOnClickCallbacks(): void
        clearOnClickCallbacks(): void

        setTheme(theme: Theme): void
        getTheme(): Theme

        getCoordinate(): Vec2
        setCoordinate(newCoordinate: Vec2): void

        getTypeID(): number
        setTypeID(id: number): void

        attachSubType(subTile: ISubTile, key: SubType): void
        detachSubType(key: SubType): void

        onDead(board: Board, isMain: boolean, other: ITile): void

        moveToRealPosition(level: Level): void
    }

    /*Base SubTile Interface*/
    export interface ISubTile {
        onDead(board: Board, isMain: boolean, other: ISubTile): void
        onResolve(): void
        onAttach(tile: ITile): void
        onDetach(): void
    }

    export interface IBoard {
        board: ITile[][]

        create(pool: IObjectPool<ITile>, level: Level): void
        match(tile1: ITile, tile2: ITile): void
        canMatch(tile1: ITile, tile2: ITile): boolean
        getPath(tile1: ITile, tile2: ITile): { path: Vec2[]; turnNum: number }
        setUpManager(game: IGameManager): void
        resetInput(): void
        addSubTile(pool: SubTilePool, level: Level, key: SubType): void
    }

    export interface ITurn {
        onEnter(): void
        onUpdate(): void
        onExit(): void
    }

    /*Object Pool*/
    export interface IPoolObject {
        isUsed(): boolean
        reSpawn(): void
        kill(): void
    }

    export interface IObjectPool<T> {
        initialize(game: GameManager): void
        getFirstItem(): T | null

        returnPool(object: T): void
        returnMultiple(objects: T[]): void
        returnAll(): void
    }

    export interface IGameManager {
        currentLevel: Level
        choose(tile: ITile): void
        unChoose(): void
        match(): void

        poolInit(): void
        createBoard(level: Level): void
    }

    export interface ITurnManager {
        switchTurn(newTurn: Turn): void
    }
}
