import { Turn } from '../../type/global'
import { BaseTurn } from './BaseTurn'

export class MatchTurn extends BaseTurn {
    onEnter(): void {
        this.game.match()
        this.game.switchTurn(Turn.END)
    }
    onExit(): void {}
    onUpdate(): void {}
}
