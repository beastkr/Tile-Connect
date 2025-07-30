import { _decorator, Button, Node, Label, Sprite, tween, Vec3, Prefab, instantiate } from 'cc'
import { BasePopup } from '../basePopup'
import { UImanager } from '../UImanager'
import { Popup } from '../../../type/global'

const { ccclass, property } = _decorator

@ccclass('Victory')
export class Victory extends BasePopup {
    @property(Label)
    private level!: Label
    @property([Sprite])
    private stars: Sprite[] = []
    @property(Sprite)
    private ribbon!: Sprite
    @property(Sprite)
    private glow: Sprite | null = null
    @property(Prefab)
    private Aura: Prefab | null = null
    @property(Prefab)
    private Aura1: Prefab | null = null
    @property(Prefab)
    private Aura2: Prefab | null = null
    @property(Button)
    private continue: Button | null = null
    public onPopupShow(): void {
        console.log('ga')
        this.popStar(() => {
            this.glow!.node.active = true
            this.playJiggle()
            this.spawnAuras()
            this.level!.node.active = true
            this.continue!.node.active = true
        })
    }

    private spawnAuras(): void {
        const positions = [new Vec3(-170, 50, -1), new Vec3(0, 50, -1), new Vec3(170, 50, -1)]
        this.stars.forEach((star) => {
            positions.forEach((position) => {
                if (this.Aura) {
                    const aura = instantiate(this.Aura)
                    this.ribbon.node.insertChild(aura, 0)
                    aura.setPosition(position)
                }
                if (this.Aura1) {
                    const aura1 = instantiate(this.Aura1)
                    this.ribbon.node.insertChild(aura1, 0)
                    aura1.setPosition(position)
                }
                if (this.Aura2) {
                    const aura2 = instantiate(this.Aura2)
                    this.ribbon.node.insertChild(aura2, 0)
                    aura2.setPosition(position)
                }
            })
        })
    }

    private playJiggle() {
        tween(this.ribbon.node)
            .to(0.08, { scale: new Vec3(1.1, 0.9, 1) })
            .to(0.08, { scale: new Vec3(0.9, 1.1, 1) })
            .to(0.08, { scale: new Vec3(1, 1, 1) })
            .start()
    }

    public popStar(onComplete?: () => void): void {
        let completedStars = 0
        const totalStars = this.stars.length

        const animateStar = (index: number) => {
            if (index >= totalStars) return

            const star = this.stars[index]
            star.node.active = true
            star.node.setScale(new Vec3(0, 0, 0))

            tween(star.node)
                .to(0.2, { scale: new Vec3(2.1, 2.1, 1) })
                .call(() => {
                    completedStars++
                    if (completedStars === totalStars) {
                        this.dropAllStars(() => {
                            if (onComplete) onComplete()
                        })
                    }
                })
                .start()

            if (index < totalStars - 1) {
                this.scheduleOnce(() => {
                    animateStar(index + 1)
                }, 0.1)
            }
        }

        animateStar(0)
    }

    private dropAllStars(onComplete?: () => void): void {
        let droppedStars = 0
        const totalStars = this.stars.length

        this.stars.forEach((star) => {
            tween(star.node)
                .to(0.2, { scale: new Vec3(1.2, 1.2, 1) }, { easing: 'backIn' })
                .call(() => {
                    droppedStars++
                    if (droppedStars === totalStars && onComplete) {
                        onComplete()
                    }
                })
                .start()
        })
    }
}
