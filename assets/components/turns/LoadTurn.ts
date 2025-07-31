import { Turn } from '../../type/global'
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
        // this.game.node.setScale(getScale())
        this.game.createBoard(this.game.currentLevel)
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
