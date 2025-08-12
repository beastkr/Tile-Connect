import { Animation, ParticleAsset, ParticleSystem2D, Tween } from 'cc'
import { getAllDescendants, Popup } from '../../type/global'

import { UImanager } from '../ui-manager/UImanager'

import { BaseTurn } from './BaseTurn'
export class PauseTurn extends BaseTurn {
    onEnter(): void {
        const des = getAllDescendants(this.game.node)
        for (const d of des) {
            Tween.pauseAllByTarget(d)
            d.getComponent(ParticleSystem2D)?.stopSystem()
            // d.getComponent(Animation)?.pause()
        }

        this.game.turnOffInput()
        this.game.unChoose()
        console.log('Pause')
        UImanager.showPopup(Popup.PAUSEPOPUP, true, this.game.currentNumber())
    }

    onExit(): void { }
    onUpdate(): void { }
}
