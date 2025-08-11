import { Turn } from '../../type/global'
import { AnimationHandler } from '../animation-handler/AnimationHandler'
import { GravityManager } from '../manager/GravityManager'
import { Timer } from '../timer/Timer'
import { BaseTurn } from './BaseTurn'
import { director } from 'cc'
import { TileConnect } from '../../type/type'
import { TutorialManager } from '../manager/TutorialManager'
import Board from '../board/Board'

export class LoadTurn extends BaseTurn {
    public onEnter(): void {
        this.game.isFirstTouch = 0
        this.game.pathPool?.returnAll()
        this.game.starPool?.returnAll()
        this.game.subtilePool.forEach((element) => {
            element.returnAll()
        })
        this.game.tilePool?.returnAll()
        this.game.unChoose()
        if (this.game.currentNumber() >= 2) {
            this.game.itemManager?.showAll()
            this.game.showAll()
        }
        this.turnOffInput()
        GravityManager.setUpManager(this.game.currentLevel)
        this.game.time = this.game.currentLevel.getTime()

        director.emit(TileConnect.GAME_EVENTS.COUNTDOWN_RESET)

        this.game.matchPair = []
        this.game.createBoard(this.game.currentLevel)
        AnimationHandler.fillProgressBar?.resetProgressBar()
        AnimationHandler.fillProgressBar?.setTotal(this.game.currentLevel.getTileNum())
        AnimationHandler.fillProgressBar?.setLv(this.game.currentNumber())

        this.turnOnInput()
        if (this.game.currentNumber() <= 2) {
            if (this.game.board) {
                TutorialManager.showCurrentTutorial(
                    this.game.currentNumber(),
                    this.game.board as Board,
                    this.game
                )
            }
        }

        this.game.switchTurn(Turn.START)
    }

    onExit(): void {}

    private turnOnInput() {
        this.game.board?.setUpManager(this.game)
    }

    private turnOffInput() {
        this.game.board?.resetInput()
    }
}
