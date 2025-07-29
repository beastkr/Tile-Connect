import { Popup, Turn } from '../../type/global'
import { LevelLoader } from '../level/LevelLoader'
import { UImanager } from '../ui-manager/UImanager'

import { BaseTurn } from './BaseTurn'
export class FailTurn extends BaseTurn {
    onEnter(): void {
        this.game.turnOffInput()
        this.game.unChoose()
        this.game.gameOver()
        console.log('Fail')

        UImanager.showPopup(Popup.FAILPOPUP, true)

    }

    onExit(): void {}
    onUpdate(): void {}
}
