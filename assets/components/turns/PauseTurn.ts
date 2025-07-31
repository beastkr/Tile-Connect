import { Victory } from './../ui-manager/victory-popup/victoryPopup'
import { Popup, Turn } from '../../type/global'
import { LevelLoader } from '../level/LevelLoader'

import { UImanager } from '../ui-manager/UImanager'

import { BaseTurn } from './BaseTurn'
export class PauseTurn extends BaseTurn {
    onEnter(): void {
        this.game.turnOffInput()
        this.game.unChoose()
        console.log('Pause')
        UImanager.showPopup(Popup.PAUSEPOPUP, true, this.game.currentNumber())
    }

    onExit(): void {}
    onUpdate(): void {}
}
