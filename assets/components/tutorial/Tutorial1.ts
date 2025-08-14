import { _decorator, Tween, tween, UIOpacity, Vec3 } from 'cc'
import { BaseTutorial } from './BaseTutorial'
import { getTilePositionByLevel } from '../../type/global'
import { TileConnect } from '../../type/type'
import Board from '../board/Board'
import GameManager from '../manager/GameManager'
import Tile from '../tiles/Tile'

const { ccclass } = _decorator

@ccclass('Level1Tutorial')
export class Level1Tutorial extends BaseTutorial {
    private currentPhaseIndex = 0
    private phases: TileConnect.PhaseConfig[] = [
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

    begin(board: Board, gm: GameManager) {
        this.currentPhaseIndex = 0
        this.gm = gm
        this.currentBoard = board

        this.resetAllSiblingIndices(board)
        this.showPhase(this.phases[this.currentPhaseIndex], board)

        this.boundOnChoose = () => {
            this.nextPhase(board)
        }
        this.boundOnTouch = () => {
            this.hideAll()
        }

        gm.onTouch(this.boundOnTouch!)
        gm.onChoose(this.boundOnChoose!)
    }

    private showPhase(phase: TileConnect.PhaseConfig, board: Board) {
        this.setupOverlay()

        const tileList: Tile[] = phase.tiles.map(([r, c]) => board.board[r][c] as Tile)
        board.resetInputExcept(tileList[0], tileList[1])

        this.storeSiblingIndices(board)
        this.setAllTilesToBackground(board)

        for (const tile of tileList) {
            tile.node.setSiblingIndex(this.overlay!.getSiblingIndex() + 1)
        }

        if (!phase.showHelpAfterClick) {
            this.showPanel(phase.helpText)
        } else {
            this.hidePanel()
        }

        this.showHand(tileList[0], tileList[1])
    }

    private nextPhase(board: Board) {
        const currentPhase = this.phases[this.currentPhaseIndex]

        if (currentPhase.showHelpAfterClick && this.help!.string === '') {
            this.showPanel(currentPhase.helpText)
            this.scheduleOnce(() => {
                this.currentPhaseIndex++
                if (this.currentPhaseIndex < this.phases.length) {
                    this.showPhase(this.phases[this.currentPhaseIndex], this.currentBoard!)
                } else {
                    this.end()
                }
            }, 1)
            return
        }

        this.currentPhaseIndex++
        if (this.currentPhaseIndex < this.phases.length) {
            this.showPhase(this.phases[this.currentPhaseIndex], this.currentBoard!)
        } else {
            this.end()
        }
    }

    private hideAll() {
        this.hidePanel()
        this.hideHand()
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
        this.hand.setPosition(startPos.clone().add(this.gm!.node.position.clone()))
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
            .to(0.5, { position: endPos.clone().add(this.gm!.node.position.clone()), scale: new Vec3(1, 1, 1) }, { easing: 'quadInOut' })
            .call(() => circle.setScale(new Vec3(0, 0, 0)))
            .to(0.1, { scale: new Vec3(0.8, 0.8, 0.8) })
            .call(animCircle)
            .delay(0.6)
            .to(0.1, { scale: new Vec3(1, 1, 1) })
            .call(() => circle.setScale(new Vec3(0, 0, 0)))

        const moveToStart = tween(this.hand)
            .to(0.5, { position: startPos.clone().add(this.gm!.node.position.clone()), scale: new Vec3(1, 1, 1) }, { easing: 'quadInOut' })
            .call(() => circle.setScale(new Vec3(0, 0, 0)))
            .to(0.1, { scale: new Vec3(0.8, 0.8, 0.8) })
            .call(animCircle)
            .delay(0.6)
            .to(0.1, { scale: new Vec3(1, 1, 1) })
            .call(() => circle.setScale(new Vec3(0, 0, 0)))

        tween(this.hand).sequence(moveToEnd, moveToStart).repeatForever().start()
    }

    end() {
        this.hideHand()
        this.hideOverlay()
        this.showPanel('Clear all tiles to win')

        if (this.currentBoard) {
            this.restoreAllSiblingIndices(this.currentBoard)
            this.currentBoard.resetInput()
            this.currentBoard.setUpManager(this.gm!)
        }
        if (this.overlay && this.overlay.parent) {
            this.overlay.removeFromParent()
        }
        this.cleanup()
    }

    public showObstacle() {
        this.showPanel("There's obstacle between the tiles")
        this.scheduleOnce(() => {
            this.hidePanel()
        }, 1)
    }

    public showInvalid() {
        this.showPanel('More than 2 turns are NOT allowed')
        this.scheduleOnce(() => {
            this.hidePanel()
        }, 1)
    }
}
