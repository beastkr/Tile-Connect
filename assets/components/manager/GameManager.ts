import { _decorator, Component } from 'cc'
import { SubType, TileType, Turn } from '../../type/global'
import { TileConnect } from '../../type/type'
import Board from '../board/Board'
import { Level } from '../level/Level'
import TilePool from '../pool/TilePool'
import { BaseTurn } from '../turns/BaseTurn'
import { EndTurn } from '../turns/EndTurn'
import { LoadTurn } from '../turns/LoadTurn'
import { MatchTurn } from '../turns/MatchTurn'
import { StartTurn } from '../turns/StartTurn'
const { ccclass, property } = _decorator

@ccclass('GameManager')
class GameManager extends Component implements TileConnect.ITurnManager, TileConnect.IGameManager {
    private turnList: Map<Turn, TileConnect.ITurn> = new Map<Turn, TileConnect.ITurn>()
    currentTurn: TileConnect.ITurn = new BaseTurn(this)
    board: TileConnect.IBoard | null = new Board()

    @property(TilePool)
    tilePool: TileConnect.IObjectPool<TileConnect.ITile> | null = null

    subtilePool: Record<SubType, TileConnect.IObjectPool<TileConnect.ISubTile>> | null = null
    firstChosen: TileConnect.ITile | null = null
    secondChosen: TileConnect.ITile | null = null

    protected start(): void {
        this.tilePool?.initialize(this)
        this.turnInit()
    }
    public isWin(): boolean {
        for (const row of this.board!.board) {
            for (const tile of row) {
                if (tile.getTypeID() != TileType.NONE) return false
            }
        }
        return true
    }

    private turnInit() {
        this.turnList.set(Turn.START, new StartTurn(this))
        this.turnList.set(Turn.MATCH, new MatchTurn(this))
        this.turnList.set(Turn.END, new EndTurn(this))
        this.turnList.set(Turn.LOAD, new LoadTurn(this))

        this.switchTurn(Turn.LOAD)
    }
    private isSame(t1: TileConnect.ITile, t2: TileConnect.ITile): boolean {
        return (
            t1.getCoordinate().x === t2.getCoordinate().x &&
            t1.getCoordinate().y === t2.getCoordinate().y
        )
    }
    private sameType(t1: TileConnect.ITile, t2: TileConnect.ITile): boolean {
        return t1.getTypeID() === t2.getTypeID()
    }

    public choose(tile: TileConnect.ITile): void {
        console.log(tile.getCoordinate())
        if (!this.firstChosen || !this.sameType(this.firstChosen, tile)) {
            this.firstChosen = tile
            console.log(
                'first: ',
                this.firstChosen.getCoordinate(),
                'second: ',
                this.secondChosen?.getCoordinate()
            )
            return
        }
        if (this.isSame(tile, this.firstChosen)) {
            this.unChoose()
            return
        }
        this.secondChosen = tile
        console.log(
            'first: ',
            this.firstChosen.getCoordinate(),
            'second: ',
            this.secondChosen?.getCoordinate()
        )
        this.switchTurn(Turn.MATCH)
    }
    public unChoose(): void {
        this.firstChosen = null
        this.secondChosen = null
    }
    public match(): void {
        if (this.firstChosen && this.secondChosen) {
            console.log(
                'matching: ',
                this.firstChosen.getCoordinate(),
                this.secondChosen.getCoordinate()
            )
            this.board?.match(this.firstChosen, this.secondChosen)
        }
    }

    public poolInit(): void {}
    public createBoard(level: Level): void {
        this.board?.create(this.tilePool!, level)
    }
    public switchTurn(newTurn: Turn): void {
        if (this.currentTurn) this.currentTurn.onExit()
        this.currentTurn = this.turnList.get(newTurn)!
        this.currentTurn.onEnter()
    }
}

export default GameManager
