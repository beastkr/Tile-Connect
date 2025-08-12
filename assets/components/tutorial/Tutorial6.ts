import { _decorator } from 'cc'
import { BaseTutorial } from './BaseTutorial'
import { Item } from '../../type/global'
import Board from '../board/Board'
import GameManager from '../manager/GameManager'

const { ccclass } = _decorator

@ccclass('Level6Tutorial')
export class Level6Tutorial extends BaseTutorial {
    private currentPhase: number = 1
    private hintUsed: boolean = false
    private shuffleUsed: boolean = false

    begin(board: Board, gm: GameManager) {
        this.gm = gm
        this.currentBoard = board
        this.resetAllSiblingIndices(board)

        this.currentPhase = 1
        this.hintUsed = false
        this.shuffleUsed = false

        this.setupOverlay()
        this.startPhase1()
        this.gm.turnOffInput()

        this.listenForHintUsage()
        this.listenForMatchPair()
        this.listenForShuffleUsage()
    }

    private startPhase1() {
        this.showPanel('Click to use defuse kit')
        this.gm!.itemManager?.hideAll()
        this.gm!.itemManager?.showItem(Item.BOOM)
    }

    private startPhase2() {
        this.currentPhase = 2
        this.showPanel('Click to use Rocket')
        this.gm!.turnOffInput()
        this.gm!.itemManager?.hideAll()
        this.gm!.itemManager?.showItem(Item.ROCKET)
    }

    private listenForHintUsage() {
        const originalUseHint = this.gm!.itemManager?.useBoom.bind(this.gm!.itemManager)

        if (this.gm!.itemManager) {
            this.gm!.itemManager.useHint = () => {
                if (this.currentPhase === 1 && !this.hintUsed) {
                    this.hintUsed = true
                    originalUseHint?.()
                    this.hideOverlay()
                    this.hidePanel()
                    this.setupOverlay()
                    this.startPhase2()
                }
            }
        }
    }

    private listenForMatchPair() {
        if (this.gm) {
            if (this.currentPhase === 1 && this.hintUsed) {
                setTimeout(() => {}, 500)
            }
        }
    }

    private listenForShuffleUsage() {
        const originalUseShuffle = this.gm!.itemManager?.useRocket.bind(this.gm!.itemManager)

        if (this.gm!.itemManager) {
            this.gm!.itemManager.useShuffle = () => {
                if (this.currentPhase === 2 && !this.shuffleUsed) {
                    this.shuffleUsed = true
                    originalUseShuffle?.()
                    setTimeout(() => {
                        this.end()
                    }, 500)
                }
            }
        }
    }

    end() {
        this.hideOverlay()
        this.hidePanel()
        this.gm?.itemManager?.showAll()

        this.gm!.board?.resetInput()
        this.gm?.turnOnInput()
        this.cleanup()
        this.restoreOriginalMethods()
    }

    private restoreOriginalMethods() {
        if (this.gm?.itemManager) {
            this.gm.itemManager.useHint = this.gm.itemManager.useBoom
            this.gm.itemManager.useShuffle = this.gm.itemManager.useRocket
        }
    }

    cleanup() {
        super.cleanup()
        this.restoreOriginalMethods()
    }
}
