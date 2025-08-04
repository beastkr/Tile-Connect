import { Popup } from '../../type/global'

import { UImanager } from '../ui-manager/UImanager'
import { BaseTurn } from './BaseTurn'

export class WinTurn extends BaseTurn {
    onEnter(): void {
        this.game.ispause = true
        this.game.isgameOver = true
        UImanager.togglePauseButton(false)
        UImanager.showPopup(Popup.WINPOPUP, true, this.game.currentNumber())
    }
    onExit(): void {}
    onUpdate(): void {}
}
