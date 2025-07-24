import { Turn } from '../../type/global'
import { BaseTurn } from './BaseTurn'

export class LoadTurn extends BaseTurn {
    public onEnter(): void {
        this.game.unChoose()
        this.turnOffInput()

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
