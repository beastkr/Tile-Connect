import { find } from 'cc'
import { Turn } from '../../type/global'
import { AnimationHandler } from '../animation-handler/AnimationHandler'
import { GravityManager } from '../manager/GravityManager'
import { BaseTurn } from './BaseTurn'

export class LoadTurn extends BaseTurn {
    public onEnter(): void {
        this.game.subtilePool.forEach((element) => {
            element.returnAll()
        })
        this.game.unChoose()
        this.turnOffInput()

        GravityManager.setUpManager(this.game.currentLevel)
        this.game.time = this.game.currentLevel.getTime()
        this.game.matchPair = []
        this.game.createBoard(this.game.currentLevel)
        AnimationHandler.fillProgressBar?.resetProgressBar()
        AnimationHandler.fillProgressBar?.setTotal(this.game.currentLevel.getTileNum())
        AnimationHandler.fillProgressBar?.setLv(this.game.currentNumber())

        this.turnOnInput()
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
