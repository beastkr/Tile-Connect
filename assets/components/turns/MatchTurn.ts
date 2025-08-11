import { Turn } from '../../type/global'
import { AnimationHandler } from '../animation-handler/AnimationHandler'

import { BaseTurn } from './BaseTurn'

export class MatchTurn extends BaseTurn {
    onEnter(): void {
        console.log('match')
        this.game.stopHint()
        while (this.game.matchPair.length > 0) this.game.match()
        Promise.all(AnimationHandler.animTile).then(() => {
            Promise.all(AnimationHandler.animList).then(() => {
                this.game.switchTurn(Turn.END)
            })
        })
    }
    onExit(): void {}
    onUpdate(): void {}
}
