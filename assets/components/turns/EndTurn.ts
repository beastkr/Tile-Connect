import { Turn } from '../../type/global'
import { LevelLoader } from '../level/LevelLoader'
import { BaseTurn } from './BaseTurn'

export class EndTurn extends BaseTurn {
    onEnter(): void {
        if (this.game.isWin()) {
            LevelLoader.checkNeedToChange('completed')
            LevelLoader.changeLevel()
            this.game.switchTurn(Turn.LOAD)
            return
        }
        this.game.switchTurn(Turn.START)
    }
    onExit(): void {}
    onUpdate(): void {}
}
