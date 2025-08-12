import { Level } from './../level/Level'
import { _decorator, Component, easing, Label, Node, Tween, tween, UIOpacity, Vec3 } from 'cc'
import GameManager from './GameManager'
import Board from '../board/Board'
import Tile from '../tiles/Tile'
import { AnimationHandler } from '../animation-handler/AnimationHandler'
import { getTilePositionByLevel, Turn } from '../../type/global'
import { EndTurn } from '../turns/EndTurn'

const { ccclass, property } = _decorator

interface PhaseConfig {
    tiles: [number, number][]
    helpText: string
    showHelpAfterClick?: boolean
}

@ccclass('TutorialManager')
export class TutorialManager extends Component {
    @property(Node) overlay: Node | null = null
    @property(Node) panel: Node | null = null
    @property(Label) help: Label | null = null
    @property(Node) hand: Node | null = null

    public static instance: TutorialManager | null = null
    private currentBoard: Board | null = null
    private gm: GameManager | null = null
    private boundOnChoose: (() => void) | null = null
    private boundOnTouch: (() => void) | null = null

    private currentPhaseIndex = 0

    private level1Phases: PhaseConfig[] = [
        {
            tiles: [
                [3, 2],
                [3, 4],
            ],
            helpText: 'Tap to connect',
        },
        {
            tiles: [
                [3, 5],
                [2, 4],
            ],
            helpText: 'Connect similar tiles with less than 2 turns',
        },
        {
            tiles: [
                [1, 5],
                [3, 1],
            ],
            helpText: 'Connect similar tiles with less than 2 turns',
        },
        {
            tiles: [
                [4, 1],
                [5, 2],
            ],
            helpText: 'More than 2 turns are NOT allowed',
            showHelpAfterClick: true,
        },
        {
            tiles: [
                [1, 2],
                [4, 2],
            ],
            helpText: "There's obstacle between the tiles",
            showHelpAfterClick: true,
        },
    ]

    start() {
        TutorialManager.instance = this
        this.hideHand()
    }

    public static showCurrentTutorial(i: number, board?: Board, gm?: GameManager) {
        if (!TutorialManager.instance) return
        if (i > 2) return
        switch (i) {
            case 1:
                if (board && gm) {
                    TutorialManager.instance.startLevel1(board, gm)
                    TutorialManager.instance.boundOnChoose = () => {
                        TutorialManager.instance?.nextPhase(board)
                    }
                    TutorialManager.instance.boundOnTouch = () => {
                        TutorialManager.instance?.hideAll()
                    }
                    gm.onTouch(TutorialManager.instance.boundOnTouch!)
                    gm.onChoose(TutorialManager.instance.boundOnChoose!)
                }
                break
        }
    }

    private startLevel1(board: Board, gm: GameManager) {
        this.currentPhaseIndex = 0
        this.gm = gm
        this.showPhase(this.level1Phases[this.currentPhaseIndex], board)
    }

    private showPhase(phase: PhaseConfig, board: Board) {
        this.currentBoard = board

        if (!this.overlay) return
        this.gm?.node.addChild(this.overlay)
        this.overlay.active = true
        this.overlay.setPosition(new Vec3())

        const tileList: Tile[] = phase.tiles.map(([r, c]) => board.board[r][c] as Tile)
        board.resetInputExcept(tileList[0], tileList[1])
        for (const row of board.board) {
            for (const tile of row) {
                ; (tile as Tile).node.setSiblingIndex(1)
            }
        }

        for (const tile of tileList) {
            tile.node.setSiblingIndex(this.overlay.getSiblingIndex() + 1)
        }

        if (!phase.showHelpAfterClick) {
            this.help!.string = phase.helpText
            this.panel!.active = true
        } else {
            this.help!.string = ''
            this.panel!.active = false
        }

        this.showHand(tileList[0], tileList[1])
    }
    private hideAll() {
        console.log('hi')
        this.panel!.active = false
        this.hideHand()
    }
    public nextPhase(board: Board) {
        const currentPhase = this.level1Phases[this.currentPhaseIndex]

        if (currentPhase.showHelpAfterClick && this.help!.string === '') {
            this.help!.string = currentPhase.helpText
            this.panel!.active = true
            this.scheduleOnce(() => {
                this.currentPhaseIndex++
                if (this.currentPhaseIndex < this.level1Phases.length) {
                    this.showPhase(this.level1Phases[this.currentPhaseIndex], this.currentBoard!)
                } else {
                    this.endTutorial(board)
                }
            }, 1)
            return
        }

        this.currentPhaseIndex++
        if (this.currentPhaseIndex < this.level1Phases.length) {
            this.showPhase(this.level1Phases[this.currentPhaseIndex], this.currentBoard!)
        } else {
            this.endTutorial(board)
        }
    }

    private endTutorial(board: Board) {
        this.hideHand()
        this.overlay!.active = false
        this.help!.string = 'Clear all tiles to win'

        if (this.boundOnChoose) {
            this.gm?.offChoose(this.boundOnChoose)
            this.boundOnChoose = null
        }
        board.resetInput()
        board.setUpManager(this.gm!)
    }

    private showHand(startTile: Tile, endTile: Tile) {
        if (!this.hand) return

        Tween.stopAllByTarget(this.hand)
        const circle = this.hand.getChildByName('circle')!
        Tween.stopAllByTarget(circle)
        Tween.stopAllByTarget(circle.getComponent(UIOpacity)!)

        this.hand.active = true
        const lv = this.gm?.currentLevel
        const startPos = getTilePositionByLevel(
            startTile.getCoordinate().x,
            startTile.getCoordinate().y,
            lv!,
            1
        ).toVec3()
        const endPos = getTilePositionByLevel(
            endTile.getCoordinate().x,
            endTile.getCoordinate().y,
            lv!,
            1
        ).toVec3()
        this.hand.setScale(new Vec3(1, 1, 1))
        this.hand.setPosition(startPos)
        circle.setScale(new Vec3(0, 0, 0))
        circle.getComponent(UIOpacity)!.opacity = 255

        const animCircle = () => {
            circle.getComponent(UIOpacity)!.opacity = 200
            circle.setScale(new Vec3(0.3, 0.3, 0.3))
            tween(circle)
                .to(0.6, { scale: new Vec3(1.5, 1.5, 2.5) }, { easing: 'quadOut' })
                .start()
            tween(circle.getComponent(UIOpacity)!)
                .to(0.6, { opacity: 0 }, { easing: 'quadOut' })
                .start()
        }

        const moveToEnd = tween(this.hand)
            .to(0.5, { position: endPos, scale: new Vec3(1, 1, 1) }, { easing: 'quadInOut' })
            .call(() => circle.setScale(new Vec3(0, 0, 0)))
            .to(0.1, { scale: new Vec3(0.8, 0.8, 0.8) })
            .call(animCircle)
            .delay(0.6)
            .to(0.1, { scale: new Vec3(1, 1, 1) })
            .call(() => circle.setScale(new Vec3(0, 0, 0)))

        const moveToStart = tween(this.hand)
            .to(0.5, { position: startPos, scale: new Vec3(1, 1, 1) }, { easing: 'quadInOut' })
            .call(() => circle.setScale(new Vec3(0, 0, 0)))
            .to(0.1, { scale: new Vec3(0.8, 0.8, 0.8) })
            .call(animCircle)
            .delay(0.6)
            .to(0.1, { scale: new Vec3(1, 1, 1) })
            .call(() => circle.setScale(new Vec3(0, 0, 0)))

        tween(this.hand).sequence(moveToEnd, moveToStart).repeatForever().start()
    }

    private hideHand() {
        if (this.hand) this.hand.active = false
    }
    public showObstacle() {
        this.panel!.active = true
        this.help!.string = "There's obstacle between the tiles"

        this.scheduleOnce(() => {
            this.panel!.active = false
        }, 1)
    }

    public showInvalid() {
        this.panel!.active = true
        this.help!.string = 'More than 2 turns are NOT allowed'

        this.scheduleOnce(() => {
            this.panel!.active = false
        }, 1)
    }
}
