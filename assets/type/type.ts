import { Vec2 } from 'cc'
import { SubType, Theme, Turn } from './global'

export namespace TileConnect {
    /*Base Tile Interface*/
    export interface ITile {
        // coordinate: Vec2
        // typeID: number
        // subTileList: Record<SubType, ISubTile>
        // onClickCallbacks: ((tile: ITile) => void)[]

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

        onDead(): void
    }

    /*Base SubTile Interface*/
    export interface ISubTile {
        onDead(): void
        onResolve(): void
    }

    export interface IBoard {
        // board: ITile[][]
        match(tile1: ITile, tile2: ITile): void
        canMatch(tile1: ITile, tile2: ITile): boolean
        getPath(tile1: ITile, tile2: ITile): { path: Vec2[]; turnNum: number }
        setUpManager(game: IGameManager): void
    }

    export interface ITurn {
        // game: IGameManager
        onEnter(): void
        onUpdate(): void
        onExit(): void
    }

    /*Object Pool*/
    export interface IPoolObject {
        // used: boolean

        isUsed(): boolean
        reSpawn(): void
        kill(): void
    }

    export interface IObjectPool<T> {
        // size: number
        // itemList: T[]

        initialize(poolSize: number): void
        getFirstItem(): T | null

        returnPool(object: T): void
        returnMultiple(objects: T[]): void
        returnAll(): void
    }

    export interface IGameManager {
        // board: IBoard
        // tilePool: IObjectPool<ITile>
        // subtilePool: Record<SubType, IObjectPool<ISubTile>>
        // firstChosen: ITile | null
        // secondChosen: ITile | null

        choose(tile: ITile): void
        unChoose(): void
        match(): void

        poolInit(): void
        createBoard(): void
    }

    export interface ITurnManager {
        // turnList: Record<Turn, ITurn>
        // currentTurn: ITurn
        switchTurn(newTurn: Turn): void
    }
}
