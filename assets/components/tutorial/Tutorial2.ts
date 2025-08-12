import { _decorator, Node, find, Widget } from 'cc'
import { BaseTutorial } from './BaseTutorial'
import Board from '../board/Board'
import GameManager from '../manager/GameManager'

const { ccclass } = _decorator

@ccclass('Level2Tutorial')
export class Level2Tutorial extends BaseTutorial {
    private originalTimerParent: Node | null = null
    private originalWidgetState:
        | {
              isAlignTop: boolean
              top: number
              target: Node | null
          }
        | undefined

    begin(board: Board, gm: GameManager) {
        this.gm = gm
        this.currentBoard = board
        this.resetAllSiblingIndices(board)

        this.setupOverlay()
        this.showPanel('Remove all icon tiles before the end of time')

        this.gm.itemManager?.hideAll()

        const timerNode = find('Canvas/Top/Timer')
        const bot = find('Canvas/Bot')
        const canvas = find('Canvas')

        if (timerNode && bot && canvas) {
            const widget = timerNode.getComponent(Widget)
            if (widget) {
                this.originalWidgetState = {
                    isAlignTop: widget.isAlignTop,
                    top: widget.top,
                    target: widget.target,
                }

                widget.target = canvas
                widget.isAlignTop = true
                widget.top = 48
                widget.updateAlignment()
            }

            this.overlay!.on(Node.EventType.TOUCH_START, () => this.end(), this)

            bot.active = false
            this.originalTimerParent = timerNode.parent
            timerNode.setParent(canvas)
            timerNode.setSiblingIndex(9999)
        }

        this.gm.turnOffInput()
    }

    end() {
        if (this.overlay) {
            this.overlay.off(Node.EventType.TOUCH_START, () => this.end(), this)
        }
        this.hideOverlay()

        const timerNode = find('Canvas/Timer')
        const top = find('Canvas/Top')

        if (timerNode && top) {
            let widget = timerNode.getComponent(Widget)
            if (widget && this.originalWidgetState) {
                timerNode.setParent(top)
                widget.target = top
                widget.isAlignTop = this.originalWidgetState.isAlignTop
                widget.top = this.originalWidgetState.top
                widget.updateAlignment()
            }
        }

        this.hidePanel()
        this.gm?.itemManager?.hideAll()
        this.gm?.board?.resetInput()
        this.gm?.turnOnInput()
        if (this.overlay && this.overlay.parent) {
            this.overlay.removeFromParent()
        }
        this.resetAllSiblingIndices(this.gm!.board as Board)

        this.cleanup()
    }
}
