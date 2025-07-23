import { _decorator, Component } from 'cc'
import { SubType, Turn } from '../../type/global'
import { TileConnect } from '../../type/type'
import Board from '../board/Board'
const { ccclass, property } = _decorator

@ccclass('GameManager')
class GameManager extends Component implements TileConnect.ITurnManager, TileConnect.IGameManager {
    private turnList: Map<Turn, TileConnect.ITurn> = new Map<Turn, TileConnect.ITurn>()
    currentTurn: TileConnect.ITurn | null = null
    board: TileConnect.IBoard | null = new Board()
    tilePool: TileConnect.IObjectPool<TileConnect.ITile> | null = null
    subtilePool: Record<SubType, TileConnect.IObjectPool<TileConnect.ISubTile>> | null = null
    firstChosen: TileConnect.ITile | null = null
    secondChosen: TileConnect.ITile | null = null
    public choose(tile: TileConnect.ITile): void {}
    public unChoose(): void {}
    public match(): void {}

    public poolInit(): void {}
    public createBoard(): void {}
    switchTurn(newTurn: Turn): void {}
}

export default GameManager
