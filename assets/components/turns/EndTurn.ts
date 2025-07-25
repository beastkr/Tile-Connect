import { Turn } from '../../type/global'
import { AnimationHandler } from '../animation-handler/AnimationHandler'
import { BaseTurn } from './BaseTurn'

export class EndTurn extends BaseTurn {
    onEnter(): void {
        if (this.game.isWin()) {
            Promise.all(AnimationHandler.animList).then(() => {
                this.game.switchTurn(Turn.LOAD)
            })
            return // prevent calling START below
        }

        this.game.switchTurn(Turn.START)
    }

    onExit(): void {}
    onUpdate(): void {}
}
