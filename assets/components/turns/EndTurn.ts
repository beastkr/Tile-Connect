import { Turn } from '../../type/global'

import { AnimationHandler } from '../animation-handler/AnimationHandler'

import { BaseTurn } from './BaseTurn'

export class EndTurn extends BaseTurn {
    onEnter(): void {
        {
            Promise.all(AnimationHandler.animList).then(() => {
                if (this.game.isWin()) {
                    this.game.switchTurn(Turn.WIN)
                } else this.game.switchTurn(Turn.START)
            })
        }
    }

    onExit(): void {}
    onUpdate(): void {}
}
