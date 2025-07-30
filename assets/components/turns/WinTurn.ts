import { Popup } from '../../type/global'

import { UImanager } from '../ui-manager/UImanager'
import { BaseTurn } from './BaseTurn'

export class WinTurn extends BaseTurn {
    onEnter(): void {
        UImanager.showPopup(Popup.WINPOPUP)
    }
    onExit(): void {}
    onUpdate(): void {}
}
