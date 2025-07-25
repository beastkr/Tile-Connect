import { Turn } from '../../type/global'
import { AnimationHandler } from '../animation-handler/AnimationHandler'
import { BaseTurn } from './BaseTurn'

export class MatchTurn extends BaseTurn {
    onEnter(): void {
        while (this.game.matchPair.length > 0) this.game.match()
        this.game.unChoose()
        Promise.all(AnimationHandler.animTile).then(() => {
            this.game.switchTurn(Turn.END)
        })
    }
    onExit(): void {}
    onUpdate(): void {}
}
