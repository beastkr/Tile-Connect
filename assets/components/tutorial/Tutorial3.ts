import { _decorator } from 'cc'
import { BaseTutorial } from './BaseTutorial'
import { Item } from '../../type/global'
import Board from '../board/Board'
import GameManager from '../manager/GameManager'

const { ccclass } = _decorator

@ccclass('Level3Tutorial')
export class Level3Tutorial extends BaseTutorial {
    private currentPhase: number = 1
    private hintUsed: boolean = false
    private shuffleUsed: boolean = false
    private originalUseHint: () => void = () => { }
    private originalUseShuffle: () => void = () => { }
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
        this.gm!.itemManager?.itemList.forEach(element => {
            element.setquantity(11)
        });
    }

    private startPhase1() {
        this.showPanel('Click to use Hint')
        this.gm!.itemManager?.hideAll()
        this.gm!.itemManager?.showItem(Item.HINT)
    }

    private startPhase2() {
        this.currentPhase = 2
        this.showPanel('Click to use Shuffle')
        this.gm!.turnOffInput()
        this.gm!.itemManager?.hideAll()
        this.gm!.itemManager?.showItem(Item.SHUFFLE)
    }

    private listenForHintUsage() {
        this.originalUseHint = this.gm!.itemManager?.useHint.bind(this.gm!.itemManager)!

        if (this.gm!.itemManager) {
            this.gm!.itemManager.useHint = () => {
                if (this.currentPhase === 1 && !this.hintUsed) {
                    this.hintUsed = true
                    this.originalUseHint()
                    this.hideOverlay()
                    this.hidePanel()
                    this.gm!.turnOnInput()
                }
            }
        }
    }

    private listenForMatchPair() {
        if (this.gm) {
            this.gm.onMatchPair(() => {
                if (this.currentPhase === 1 && this.hintUsed) {
                    setTimeout(() => {
                        this.setupOverlay()
                        this.startPhase2()
                    }, 500)
                }
            })
        }
    }

    private listenForShuffleUsage() {
        this.originalUseShuffle = this.gm!.itemManager?.useShuffle.bind(this.gm!.itemManager)!

        if (this.gm!.itemManager) {
            this.gm!.itemManager.useShuffle = () => {
                if (this.currentPhase === 2 && !this.shuffleUsed) {
                    this.shuffleUsed = true
                    this.originalUseShuffle?.()
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
        this.gm?.itemManager?.hideAll()
        this.gm?.itemManager?.showItem(Item.HINT)
        this.gm?.itemManager?.showItem(Item.SHUFFLE)

        this.gm!.board?.resetInput()
        this.gm?.turnOnInput()
        this.cleanup()
        this.restoreOriginalMethods()
    }

    private restoreOriginalMethods() {
        if (this.gm?.itemManager) {
            this.gm.itemManager.useHint = this.originalUseHint
            this.gm.itemManager.useShuffle = this.originalUseShuffle
        }
    }

    cleanup() {
        super.cleanup()
        this.restoreOriginalMethods()
    }
}
