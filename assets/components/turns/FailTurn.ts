import { Popup } from '../../type/global'

import { UImanager } from '../ui-manager/UImanager'

import { BaseTurn } from './BaseTurn'
export class FailTurn extends BaseTurn {
    onEnter(): void {
        this.game.turnOffInput()
        UImanager.togglePauseButton(false)
        this.game.unChoose()
        console.log('Fail')
        UImanager.showPopup(Popup.WINPOPUP, true, this.game.currentNumber())
    }

    onExit(): void {}
    onUpdate(): void {}
}
