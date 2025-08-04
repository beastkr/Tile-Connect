import { Popup } from '../../type/global'

import { UImanager } from '../ui-manager/UImanager'

import { BaseTurn } from './BaseTurn'
export class BombFail extends BaseTurn {
    onEnter(): void {
        this.game.turnOffInput()
        UImanager.togglePauseButton(false)
        this.game.unChoose()
        console.log('Fail')
        UImanager.showPopup(Popup.BOOMPOPUP, true, this.game.currentNumber())
    }

    onExit(): void {}
    onUpdate(): void {}
}
