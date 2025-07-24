import { Turn } from '../../type/global'
import { BaseTurn } from './BaseTurn'

export class StartTurn extends BaseTurn {
    public onEnter(): void {
        if (this.game.matchPair.length > 0) {
            this.game.switchTurn(Turn.MATCH)
            return
        }
        // this.game.unChoose()
        // this.turnOnInput()
    }

    onExit(): void {
        // this.turnOffInput()
    }
}
