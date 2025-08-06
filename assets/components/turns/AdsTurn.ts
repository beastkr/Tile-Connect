import { Popup } from '../../type/global'

import { UImanager } from '../ui-manager/UImanager'

import { BaseTurn } from './BaseTurn'
export class AdsTurn extends BaseTurn {
    onEnter(): void {
        this.game.isgameOver = true
        this.game.turnOffInput()
        UImanager.togglePauseButton(false)
        this.game.unChoose()
        console.log('ads')
        UImanager.showPopup(Popup.ADSPOPUP, true, this.game.currentNumber())
    }

    onExit(): void {}
    onUpdate(): void {}
}
