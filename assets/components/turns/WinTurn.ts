import { Popup, Turn } from '../../type/global'

import { LevelLoader } from '../level/LevelLoader'

import { AnimationHandler } from '../animation-handler/AnimationHandler'

import { BaseTurn } from './BaseTurn'
import { UImanager } from '../ui-manager/UImanager'

export class WinTurn extends BaseTurn {
    onEnter(): void {
        UImanager.showPopup(Popup.WINPOPUP)
    }
    onExit(): void {}
    onUpdate(): void {}
}
