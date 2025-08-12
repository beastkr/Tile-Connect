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
        this.originalUseHint = this.gm!.itemManager?.useBoom.bind(this.gm!.itemManager)!
        console.log(this.originalUseHint)

        if (this.gm!.itemManager) {

            this.gm!.itemManager.useBoom = () => {
                console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaa')
                if (this.currentPhase === 1 && !this.hintUsed) {

                    this.hintUsed = true
                    this.originalUseHint()
                    this.hideOverlay()
                    this.hidePanel()
                    this.setupOverlay()
                    this.startPhase2()
                }
            }
            console.log(this.gm!.itemManager.useBoom)
        }
    }


    private listenForShuffleUsage() {
        this.originalUseShuffle = this.gm!.itemManager?.useRocket.bind(this.gm!.itemManager)!

        if (this.gm!.itemManager) {
            this.gm!.itemManager.useRocket = () => {
                if (this.currentPhase === 2 && !this.shuffleUsed) {
                    this.shuffleUsed = true

                    this.originalUseShuffle()
                    this.end()


                }
            }
        }
    }

    end() {
        // console.log('ending')
        this.gm?.itemManager?.showAll()
        this.gm!.board?.resetInput()
        this.gm?.turnOnInput()
        this.cleanup()
        this.restoreOriginalMethods()
        this.hideOverlay()
        this.hidePanel()
    }

    private restoreOriginalMethods() {
        if (this.gm?.itemManager) {
            this.gm.itemManager.useBoom = this.originalUseHint
            this.gm.itemManager.useRocket = this.originalUseShuffle
        }
    }

    cleanup() {
        super.cleanup()
        this.restoreOriginalMethods()
    }
}
