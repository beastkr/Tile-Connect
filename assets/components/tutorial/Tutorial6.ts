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
    private originalUseBoom: () => void = () => { }
    private originalUseRocket: () => void = () => { }

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

        this.listenForBoomUsage()
        this.listenForRocketUsage()
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

    private listenForBoomUsage() {
        this.originalUseBoom = this.gm!.itemManager?.useBoom.bind(this.gm!.itemManager)!

        if (this.gm!.itemManager) {
            this.gm!.itemManager.useBoom = () => {
                if (this.currentPhase === 1 && !this.hintUsed) {
                    this.hintUsed = true
                    this.originalUseBoom()
                    this.hideOverlay()
                    this.hidePanel()
                    this.setupOverlay()
                    this.scheduleOnce(() => {
                        this.startPhase2()
                    }, 1)
                }
            }
            console.log(this.gm!.itemManager.useBoom)
        }
    }

    private listenForRocketUsage() {
        this.originalUseRocket = this.gm!.itemManager?.useRocket.bind(this.gm!.itemManager)!

        if (this.gm!.itemManager) {
            this.gm!.itemManager.useRocket = () => {
                if (this.currentPhase === 2 && !this.shuffleUsed) {
                    this.shuffleUsed = true

                    this.originalUseRocket()
                    this.end()
                }
            }
        }
    }

    end() {
        // this.gm?.itemManager?.showAll()
        this.gm!.board?.resetInput()
        this.gm?.turnOnInput()
        this.cleanup()
        this.restoreOriginalMethods()
        this.hideOverlay()
        this.hidePanel()
    }

    private restoreOriginalMethods() {
        if (this.gm?.itemManager) {

            this.gm.itemManager.useBoom = this.originalUseBoom
            this.gm.itemManager.useRocket = this.originalUseRocket

        }
    }

    cleanup() {
        super.cleanup()
        this.restoreOriginalMethods()
    }
}
