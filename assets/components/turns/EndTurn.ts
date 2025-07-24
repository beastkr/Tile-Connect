import { Turn } from '../../type/global'
import { BaseTurn } from './BaseTurn'

export class EndTurn extends BaseTurn {
    onEnter(): void {
        if (this.game.isWin()) {
            this.game.switchTurn(Turn.LOAD)
            return
        }
        this.game.switchTurn(Turn.START)
    }
    onExit(): void {}
    onUpdate(): void {}
}
