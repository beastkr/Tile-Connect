import { _decorator, Color, Component, director, find, tween } from 'cc'

import { Item, SUBTILE_PATH, SubType, TileType, Turn } from '../../type/global'
import { TileConnect } from '../../type/type'
import Board from '../board/Board'
import { Level } from '../level/Level'
import { LevelLoader } from '../level/LevelLoader'
import PathPool from '../pool/PathPool'
import StarPool from '../pool/StarPool'
import TilePool from '../pool/TilePool'
import SubTilePool from '../subtiles/SubTilePool'
import Tile from '../tiles/Tile'
import { BaseTurn } from '../turns/BaseTurn'
import { EndTurn } from '../turns/EndTurn'
import { LoadTurn } from '../turns/LoadTurn'
import { MatchTurn } from '../turns/MatchTurn'
import { StartTurn } from '../turns/StartTurn'

import { Path } from '../path/Path'
import { Star } from '../star/Star'
import { FailTurn } from '../turns/FailTurn'

import { ItemManager } from './ItemManager'

import { PauseTurn } from '../turns/PauseTurn'
import { WinTurn } from '../turns/WinTurn'
import { UImanager } from '../ui-manager/UImanager'
import { GAME_EVENTS } from '../subtiles/Countdown'
import { BombFail } from '../turns/BombFail'

const { ccclass, property } = _decorator

const hi = new LevelLoader()

@ccclass('GameManager')
class GameManager extends Component implements TileConnect.ITurnManager, TileConnect.IGameManager {
    currentLevel: Level = hi.getCurrentLevel()
    time: number = 0
    ispause: boolean = false
    private turnList: Map<Turn, TileConnect.ITurn> = new Map<Turn, TileConnect.ITurn>()
    private eventTarget = new EventTarget()

    currentTurn: TileConnect.ITurn = new BaseTurn(this)
    board: TileConnect.IBoard | null = new Board()
    matchPair: { tile1: TileConnect.ITile; tile2: TileConnect.ITile }[] = []
    @property(TilePool)
    tilePool: TileConnect.IObjectPool<TileConnect.ITile> | null = null
    @property(Map<SubType, TileConnect.IObjectPool<TileConnect.ISubTile>>)
    subtilePool: Map<SubType, TileConnect.IObjectPool<TileConnect.ISubTile>> = new Map<
        SubType,
        TileConnect.IObjectPool<TileConnect.ISubTile>
    >()
    @property(ItemManager)
    itemManager: ItemManager | null = null
    @property(PathPool)
    public pathPool: PathPool | null = null
    @property(StarPool)
    public starPool: StarPool | null = null
    firstChosen: Tile | null = null
    secondChosen: Tile | null = null
    hintPath: Path[] = []
    hintPoint: Star[] = []
    hintTile: Tile[] = []
    isgameOver: boolean = false

    public onMatchPair(callback: () => void) {
        this.eventTarget.addEventListener('matchPair', callback)
    }

    public offMatchPair(callback: () => void) {
        this.eventTarget.removeEventListener('matchPair', callback)
    }

    private emitMatchPair() {
        this.eventTarget.dispatchEvent(new Event('matchPair'))
    }

    stopHint() {
        if (this.hintPath.length == 0) return
        for (const path of this.hintPath) {
            path.updateVisual(path.node)
        }
        for (const star of this.hintPoint) {
            tween(star.circle!)
                .to(0.2, { color: new Color(255, 255, 255, 0) })
                .call(() => {
                    star.kill()
                    star.circle!.color = new Color(255, 255, 255, 255)
                })
                .start()
        }
        this.hintTile.forEach((tile) => {
            tile.onUnHint()
        })
        this.hintPath = []
        this.hintPoint = []
        this.hintTile = []
        this.itemManager?.unlockItem(Item.HINT)
    }

    protected start(): void {
        this.tilePool?.initialize(this)
        this.pathPool?.initialize(this)
        this.starPool?.initialize(this)
        this.subTilePoolInit()
        this.turnInit()
        director.on(
            GAME_EVENTS.COUNTDOWN_COMPLETE,
            () => {
                this.switchTurn(Turn.BOOM)
            },
            this
        )
        // this.itemManager?.intialize(this)
    }

    private subTilePoolInit() {
        const poolRoot = find(SUBTILE_PATH)
        for (const child of poolRoot?.children!) {
            this.subtilePool.set(
                child.name as SubType,
                child?.getComponent(SubTilePool) as SubTilePool
            )
        }

        this.subtilePool.forEach((sub) => {
            sub.initialize(this)
        })
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
        this.turnList.set(Turn.FAIL, new FailTurn(this))
        this.turnList.set(Turn.WIN, new WinTurn(this))
        this.turnList.set(Turn.PAUSE, new PauseTurn(this))
        this.turnList.set(Turn.BOOM, new BombFail(this))
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
        if (tile.getTypeID() == TileType.NONE) return
        console.log(tile.getCoordinate())
        if (!this.firstChosen || !this.sameType(this.firstChosen, tile)) {
            this.firstChosen?.onUnchoose()
            this.firstChosen = tile as Tile
            this.firstChosen.onChoose()
            this.stopHint()
            console.log(
                'first: ',
                this.firstChosen.getCoordinate(),
                'second: ',
                this.secondChosen?.getCoordinate()
            )
            return
        }
        if (this.isSame(tile, this.firstChosen)) {
            this.firstChosen?.onChoose()
            this.unChoose()
            return
        }
        this.secondChosen = tile as Tile
        console.log(
            'first: ',
            this.firstChosen.getCoordinate(),
            'second: ',
            this.secondChosen?.getCoordinate()
        )
        this.matchPair.push({ tile1: this.firstChosen, tile2: this.secondChosen })

        this.switchTurn(Turn.MATCH)
        // this.unChoose()
    }
    public unChoose(): void {
        this.firstChosen?.onUnchoose()
        this.firstChosen = null
        this.secondChosen = null
    }
    public match(): void {
        if (this.matchPair.length > 0) {
            if (this.board?.canMatch(this.matchPair[0].tile1, this.matchPair[0].tile2)) {
                this.emitMatchPair()
            }
            this.board?.match(this.matchPair[0].tile1, this.matchPair[0].tile2)
            this.matchPair.shift()
        }
    }
    public currentNumber(): number {
        return hi.getCurrentLevelNumber()
    }

    public poolInit(): void {}
    public createBoard(level: Level): void {
        this.subtilePool.forEach((p) => {
            p.returnAll()
        })
        this.tilePool?.returnAll()
        this.itemManager?.intialize(this)
        this.board?.create(this.tilePool!, level)
        for (const pool of this.subtilePool) {
            this.board?.addSubTile(pool[1] as SubTilePool, this.currentLevel, pool[0])
        }
    }
    public switchTurn(newTurn: Turn): void {
        if (this.isgameOver) return
        if (this.currentTurn) this.currentTurn.onExit()
        this.currentTurn = this.turnList.get(newTurn)!
        this.currentTurn.onEnter()
    }
    public turnOnInput() {
        this.board?.setUpManager(this)
    }
    public restart() {
        this.ispause = false
        this.isgameOver = false
        UImanager.togglePauseButton(true)
        UImanager.hideAllPopups()
        LevelLoader.checkNeedToChange('failed')
        LevelLoader.changeLevel().then(() => {
            this.switchTurn(Turn.LOAD)
        })
    }
    public pause() {
        this.ispause = true
        UImanager.hideAllPopups()
        UImanager.togglePauseButton(false)
        this.switchTurn(Turn.PAUSE)
    }
    public unPause() {
        this.ispause = false
        UImanager.hideAllPopups()
        UImanager.togglePauseButton(true)
        this.turnOnInput()
        this.switchTurn(Turn.START)
    }
    public moveOn() {
        this.isgameOver = false
        this.ispause = false
        UImanager.hideAllPopups()
        LevelLoader.checkNeedToChange('completed')
        LevelLoader.changeLevel().then(() => {
            this.switchTurn(Turn.LOAD)
        })
    }
    public turnOffInput() {
        this.board?.resetInput()
    }
    protected onDestroy(): void {
        director.off(GAME_EVENTS.COUNTDOWN_COMPLETE, () => {}, this)
    }
}

export default GameManager
