import { Popup } from '../../type/global'

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
