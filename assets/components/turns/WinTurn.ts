import { FillProgressBar } from './../animation-handler/FillProgressBar'
import { find, tween, Vec3 } from 'cc'
import { Popup } from '../../type/global'
import StarPool from '../pool/StarPool'
import { UImanager } from '../ui-manager/UImanager'
import { BaseTurn } from './BaseTurn'

import { LevelLoader } from '../level/LevelLoader'
import { AnimationHandler } from '../animation-handler/AnimationHandler'

export class WinTurn extends BaseTurn {
    onEnter(): void {

        Promise.all(AnimationHandler.animList).then(() => {
            this.game.isgameOver = true
 UImanager.togglePauseButton(false)
            if (AnimationHandler.fillProgressBar?.isLastStar() == false) {
                AnimationHandler.fillProgressBar?.updateTillWin()
            }
            const timerNode = find('Canvas/Top/Timer')
            if (timerNode) {
                const clockNode = timerNode.getChildByName('clock')
                if (clockNode) {
                    const worldPos = clockNode.getWorldPosition()
                    if (this.game.starPool) {
                        this.startStarAnimation(worldPos, this.game.starPool)
                    }

                }
            }

            const originalTime = this.game.time
            tween({ time: originalTime })
                .to(
                    2,
                    { time: 0 },
                    {
                        onUpdate: (target) => {
                            if (target) {
                                this.game.time = Math.max(0, target.time)
                            }
                        },
                    }
                )
                .delay(0.2)
                .call(() => {
                    UImanager.showPopup(
                        Popup.WINPOPUP,
                        true,
                        LevelLoader.getInstance().getCurrentLevelNumber()
                    )
                })
                .start()
        })
    }

    private startStarAnimation(clockPos: Vec3, pool: StarPool) {
        const totalStars = 10
        const totalDuration = 2
        const starInterval = totalDuration / totalStars

        for (let i = 0; i < totalStars; i++) {
            tween({})
                .delay(i * starInterval)
                .call(() => {
                    const star = pool.getFirstItem()
                    if (star) {
                        star.winPut(clockPos)
                    }
                })
                .start()
        }
    }

    onExit(): void {}
    onUpdate(): void {}
}
