import { Turn } from '../../type/global'
import { BaseTurn } from './BaseTurn'

export class MatchTurn extends BaseTurn {
    onEnter(): void {
        while (this.game.matchPair.length > 0) this.game.match()
        this.game.unChoose()
        this.game.switchTurn(Turn.END)
    }
    onExit(): void {}
    onUpdate(): void {}
}
