import { Turn } from '../../type/global'

import { LevelLoader } from '../level/LevelLoader'

import { AnimationHandler } from '../animation-handler/AnimationHandler'

import { BaseTurn } from './BaseTurn'

export class EndTurn extends BaseTurn {
    onEnter(): void {
        if (this.game.isWin()) {
            Promise.all(AnimationHandler.animList).then(() => {
                // LevelLoader.checkNeedToChange('completed')
                // LevelLoader.changeLevel()
                // this.game.switchTurn(Turn.LOAD)
                this.game.switchTurn(Turn.WIN)
            })
            return // prevent calling START below
        }

        this.game.switchTurn(Turn.START)
    }

    onExit(): void {}
    onUpdate(): void {}
}
