import {
    _decorator,
    Animation,
    Color,
    Component,
    director,
    find,
    ParticleSystem2D,
    Tween,
    tween,
    Vec3,
    view,
    Widget,
} from 'cc'

import { getAllDescendants, Item, SFX, SUBTILE_PATH, SubType, TileType, Turn } from '../../type/global'
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
import { AdsTurn } from '../turns/AdsTurn'
import { BombFail } from '../turns/BombFail'
import { FailTurn } from '../turns/FailTurn'
import { PauseTurn } from '../turns/PauseTurn'
import { WinTurn } from '../turns/WinTurn'
import { UImanager } from '../ui-manager/UImanager'
import { ItemManager } from './ItemManager'

import { InvalidPath } from '../path/InvalidPath'
import InvalidPool from '../pool/InvalidPool'
import NopePool from '../pool/NopePool'
import { TutorialManager } from './TutorialManager'

import { SoundManager } from './SoundManager'
import { ConfettiManager } from '../confetti/ConfettiManager'


const { ccclass, property } = _decorator

@ccclass('GameManager')
class GameManager extends Component implements TileConnect.ITurnManager, TileConnect.IGameManager {
    private levelLoader: LevelLoader = LevelLoader.getInstance()

    currentLevel!: Level
    time: number = 0
    isFirstTouch: number = 0
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
    @property(InvalidPool)
    public invalid: InvalidPool | null = null
    @property(NopePool)
    public nope: NopePool | null = null

    firstChosen: Tile | null = null
    secondChosen: Tile | null = null
    hintPath: Path[] = []
    hintPoint: Star[] = []

    hintTile: Tile[] = []
    isgameOver: boolean = false
    @property(ConfettiManager)
    conf: ConfettiManager[] = []

    public onMatchPair(callback: () => void) {
        this.eventTarget.addEventListener('matchPair', callback)
    }

    public offMatchPair(callback: () => void) {
        this.eventTarget.removeEventListener('matchPair', callback)
    }
    public onTouch(callback: () => void) {
        this.eventTarget.addEventListener('touch', callback)
    }

    public offTouch(callback: () => void) {
        this.eventTarget.removeEventListener('touch', callback)
    }
    public onChoose(callback: () => void) {
        this.eventTarget.addEventListener('choose', callback)
    }

    public offChoose(callback: () => void) {
        this.eventTarget.removeEventListener('choose', callback)
    }
    private emitChoose() {
        this.eventTarget.dispatchEvent(new Event('choose'))
    }
    private emitMatchPair() {
        this.eventTarget.dispatchEvent(new Event('matchPair'))
    }
    private emitTouch() {
        this.eventTarget.dispatchEvent(new Event('touch'))
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
        this.itemManager?.itemList.get(Item.HINT)?.enableFunction()
    }

    protected start(): void {
        this.tilePool?.initialize(this)
        this.pathPool?.initialize(this)
        this.starPool?.initialize(this)
        this.invalid?.initialize(this)
        this.nope?.initialize(this)
        this.subTilePoolInit()
        this.hideAll()
        director.on(TileConnect.GAME_EVENTS.START_COUNTDOWN, () => { }, this)
        this.levelLoader.restartLevel().then(() => {
            this.currentLevel = this.levelLoader.getCurrentLevel()

            console.log(this.pathPool)
            const s = view.getVisibleSize()

            if (s.height >= s.width) {
                this.node.setPosition(new Vec3(0, 0))
                this.currentLevel.scale = s.width / (this.currentLevel.gridWidth + 3) / 80
            } else {
                this.node.setPosition(new Vec3(0, -50))
                this.currentLevel.scale = s.height / (this.currentLevel.gridHeight + 3) / 80
            }
            this.currentLevel.tileSize = this.currentLevel.scale * 80 + 5

            this.turnInit()
            view.on('canvas-resize', this.resize, this)
            director.on(
                TileConnect.GAME_EVENTS.COUNTDOWN_COMPLETE,
                () => {
                    this.switchTurn(Turn.BOOM)
                },
                this
            )
        })
    }
    resize() {
        const s = view.getVisibleSize()
        const wgO = this.node.getChildByName('Overlay')?.getComponent(Widget)

        if (s.height >= s.width) {
            if (wgO) wgO.verticalCenter = 0
            this.node.setPosition(new Vec3(0, 0))
            this.currentLevel.scale = s.width / (this.currentLevel.gridWidth + 3) / 80
        } else {
            if (wgO) wgO.verticalCenter = 50
            this.node.setPosition(new Vec3(0, -50))
            this.currentLevel.scale = s.height / (this.currentLevel.gridHeight + 3) / 80
        }
        this.currentLevel.tileSize = this.currentLevel.scale * 80 + 5
        this.board?.board.forEach((tile) => {
            tile.forEach((t) => {
                ; (t as Tile).reScale(this.currentLevel.scale)
                    ; (t as Tile).moveToRealPositionWithPadding(this.currentLevel, false)
            })
        })
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
        this.turnList.set(Turn.ADS, new AdsTurn(this))

        this.switchTurn(Turn.LOAD)
    }

    private isSame(t1: TileConnect.ITile, t2: TileConnect.ITile): boolean {
        return (
            t1.getCoordinate().x === t2.getCoordinate().x &&
            t1.getCoordinate().y === t2.getCoordinate().y
        )
    }
    public hideBot() {
        const canvas = this.node.scene.getChildByName('Canvas')
        if (!canvas) return
        const botNode = canvas.getChildByName('Bot')
        if (botNode) botNode.active = false
    }
    private hideAll() {
        const canvas = this.node.scene.getChildByName('Canvas')
        console.log('hide')
        if (!canvas) return

        const topNode = canvas.getChildByName('Top')
        const botNode = canvas.getChildByName('Bot')
        const combo = find('UImanager/combo', canvas)
        const good = find('UImanager/good', canvas)

        this.itemManager?.hideAll()
        if (topNode) topNode.active = false
        if (botNode) botNode.active = false
        if (combo) combo.active = false
        if (good) good.active = false
    }
    public showAll() {
        const canvas = this.node.scene.getChildByName('Canvas')
        console.log('hide')
        if (!canvas) return

        const topNode = canvas.getChildByName('Top')
        const combo = find('UImanager/combo', canvas)
        const good = find('UImanager/good', canvas)
        const botNode = canvas.getChildByName('Bot')

        if (topNode) topNode.active = true

        if (botNode && view.getVisibleSize().height > view.getVisibleSize().width) botNode.active = true

        if (combo) combo.active = true
        if (good) good.active = true
        this.resize()
    }
    private sameType(t1: TileConnect.ITile, t2: TileConnect.ITile): boolean {
        return t1.getTypeID() === t2.getTypeID()
    }
    public adsPop() {
        this.switchTurn(Turn.ADS)
        console.log(this.currentTurn)
    }
    public choose(tile: TileConnect.ITile): void {
        if (tile.getTypeID() == TileType.NONE) return
        this.emitTouch()
        this.isFirstTouch++
        if (this.isFirstTouch == 1) {
            director.emit(TileConnect.GAME_EVENTS.START_COUNTDOWN)
        }

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
        this.emitChoose()

        this.secondChosen = tile as Tile
        console.log(
            'first: ',
            this.firstChosen.getCoordinate(),
            'second: ',
            this.secondChosen?.getCoordinate()
        )

        this.matchPair.push({ tile1: this.firstChosen, tile2: this.secondChosen })
        this.unChoose()



        this.switchTurn(Turn.MATCH)
    }

    public unChoose(): void {
        this.firstChosen?.onUnchoose()
        this.firstChosen = null
        this.secondChosen = null
    }

    public match(): void {
        if (this.matchPair.length > 0) {
            console.log(this.matchPair[0])
            const path = this.board?.getPath(this.matchPair[0].tile1, this.matchPair[0].tile2)

            if (this.board?.canMatch(this.matchPair[0].tile1, this.matchPair[0].tile2, path!.path, path!.turnNum)) {
                this.emitMatchPair()
            }
            this.board?.match(this.matchPair[0].tile1, this.matchPair[0].tile2)
            this.matchPair.shift()
        }
    }

    public currentNumber(): number {
        return this.levelLoader.getCurrentLevelNumber()
    }

    public poolInit(): void { }

    public createBoard(level: Level): void {
        this.hintPath = []
        this.hintPoint = []
        this.hintTile = []
        this.subtilePool.forEach((p) => {
            p.returnAll()
        })
        this.tilePool?.returnAll()
        this.itemManager?.intialize(this)
        this.board?.create(this.tilePool!, level)
        for (const pool of this.subtilePool) {
            this.board?.addSubTile(pool[1] as SubTilePool, this.currentLevel!, pool[0])
        }
        this.currentLevel = this.levelLoader.getCurrentLevel()
    }

    public switchTurn(newTurn: Turn): void {
        if (this.isgameOver) return
        if (this.currentTurn) this.currentTurn.onExit()
        this.currentTurn = this.turnList.get(newTurn)!
        this.currentTurn.onEnter()
    }

    hideItem() {
        this.itemManager!.node.active = false
    }
    showItem() {
        this.itemManager!.node.active = true
    }

    public turnOnInput() {
        const tiles = (this.tilePool as TilePool).itemList
        tiles.forEach((tile) => {
            if (tile.onClickCallbacks.length == 0)
                tile.addOnClickCallback((tile: TileConnect.ITile) => this.choose(tile))
        })
    }

    public restart() {
        SoundManager.instance.playSFX(SFX.CLICK)
        this.ispause = false
        this.isgameOver = false
        const des = getAllDescendants(this.node)
        for (const d of des) {
            Tween.stopAllByTarget(d)
            d.getComponent(ParticleSystem2D)?.stopSystem()
        }
        UImanager.togglePauseButton(true)
        UImanager.hideAllPopups()
        this.levelLoader.checkNeedToChange('failed')
        this.levelLoader.restartLevel().then(() => {
            director.emit(TileConnect.GAME_EVENTS.COUNTDOWN_RESET)
            this.switchTurn(Turn.LOAD)
        })
    }

    public pause() {
        SoundManager.instance.playSFX(SFX.CLICK)
        this.ispause = true

        UImanager.hideAllPopups()
        UImanager.togglePauseButton(false)
        this.switchTurn(Turn.PAUSE)
        // this.hideItem()
    }
    public rescue() {
        SoundManager.instance.playSFX(SFX.CLICK)
        this.isgameOver = false
        this.ispause = false
        UImanager.hideAllPopups()
        UImanager.togglePauseButton(true)
        this.time += 65
        director.emit(TileConnect.GAME_EVENTS.COUNTDOWN_RESET)
        director.emit(TileConnect.GAME_EVENTS.START_COUNTDOWN)

        this.turnOnInput()
        this.switchTurn(Turn.START)
    }
    public unPause() {
        this.ispause = false
        SoundManager.instance.playSFX(SFX.CLICK)
        const des = getAllDescendants(this.node)
        for (const d of des) {
            Tween.resumeAllByTarget(d)
            if (d.getComponent(ParticleSystem2D)) {
                d.getComponent(ParticleSystem2D)?.resetSystem()
                // d.getComponent(Animation)?.resume()
            }
        }
        UImanager.hideAllPopups()
        UImanager.togglePauseButton(true)
        this.turnOnInput()
        this.showItem()
        this.switchTurn(Turn.START)
    }

    public moveOn() {
        SoundManager.instance.playSFX(SFX.CLICK)
        this.isgameOver = false
        this.ispause = false
        UImanager.togglePauseButton(true)
        UImanager.hideAllPopups()
        this.levelLoader.checkNeedToChange('completed')
        this.levelLoader.changeLevel().then(() => {
            this.switchTurn(Turn.LOAD)
        })
    }

    public turnOffInput() {
        const tiles = (this.tilePool as TilePool).itemList
        tiles.forEach((tile) => {
            tile.clearOnClickCallbacks()
        })
    }

    protected onDestroy(): void {

        director.off(TileConnect.GAME_EVENTS.COUNTDOWN_COMPLETE, () => { }, this)
    }

    public setActive(active: boolean): void {
        this.node.active = active

    }
}

export default GameManager
