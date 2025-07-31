import { Popup } from '../../type/global'

import { UImanager } from '../ui-manager/UImanager'
import { BaseTurn } from './BaseTurn'

export class WinTurn extends BaseTurn {
    onEnter(): void {
        UImanager.showPopup(Popup.WINPOPUP, true, this.game.currentNumber())
    }
    onExit(): void {}
    onUpdate(): void {}
}
