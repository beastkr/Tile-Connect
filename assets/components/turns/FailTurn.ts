import { Victory } from './../ui-manager/victory-popup/victoryPopup'
import { Popup, Turn } from '../../type/global'
import { LevelLoader } from '../level/LevelLoader'

import { UImanager } from '../ui-manager/UImanager'

import { BaseTurn } from './BaseTurn'
export class FailTurn extends BaseTurn {
    onEnter(): void {
        this.game.turnOffInput()
        this.game.unChoose()
        console.log('Fail')
        UImanager.showPopup(Popup.FAILPOPUP, true, this.game.currentNumber())
    }

    onExit(): void {}
    onUpdate(): void {}
}
