import { _decorator, Button, Label, Node, ParticleSystem2D, Sprite, Tween, tween, Vec3 } from 'cc'
import { BasePopup } from '../basePopup'
import { SoundManager } from '../../manager/SoundManager'
import { SFX } from 'db://assets/type/global'

const { ccclass, property } = _decorator

@ccclass('Victory')
export class Victory extends BasePopup {
    @property(Label)
    private level!: Label
    @property([Node])
    private stars: Node[] = []
    @property(Sprite)
    private ribbon!: Sprite
    @property(Sprite)
    private glow: Sprite | null = null
    @property(Button)
    private continue: Button | null = null

    public onPopupShow(curr: number): void {
        this.resetAura()
        this.popStar(() => {
            this.dropAllStars(() => {
                this.trailStar()
                this.playAura()
                this.glow!.node.active = true
                this.repeatStar()
                this.playJiggle()
                this.playLevel(() => { }, curr)
                this.playContinue()
            })
        })
    }
    private playLevel(onComplete: () => void, curr: number) {
        this.level!.string = `LEVEL ${curr}`
        this.level!.node.active = true

        this.level!.node.scale = new Vec3(0, 0, 1)
        tween(this.level!.node)
            .to(0.2, { scale: new Vec3(1, 1, 1) }, {})
            .call(() => {
                onComplete()
            })
            .start()
    }
    private playContinue(onComplete?: () => void) {
        this.continue!.node.active = true
        this.continue!.node.scale = new Vec3(0, 0, 1)
        tween(this.continue!.node)
            .to(0.05, { scale: new Vec3(1, 1, 1) }, {})
            .start()
    }
    private playAura() {
        this.stars.forEach((starNode) => {
            const Aura = starNode.getChildByName('MainAura')
            if (Aura) {
                Aura.active = true
                Aura.getChildByName('Aura')?.getComponent(ParticleSystem2D)?.resetSystem()
                Aura.getChildByName('Aura2')?.getComponent(ParticleSystem2D)?.resetSystem()
                Aura.getChildByName('Aura1')?.getComponent(ParticleSystem2D)?.resetSystem()
                console.log(Aura)
            }
        })
    }
    private resetAura() {
        this.level!.string = ``

        this.stars.forEach((starNode) => {
            const Aura = starNode.getChildByName('MainAura')
            if (Aura) {
                Aura.active = false
            }
            this.glow!.node.active = false

            const starChildNode = starNode.getChildByName('Star')
            const trail = starChildNode?.getChildByName('Trail')
            if (trail) {
                trail.active = false
            }
        })
    }
    private playJiggle(onComplete?: () => void) {
        tween(this.ribbon.node)
            .to(0.08, { scale: new Vec3(1.09, 0.98, 1) })
            .to(0.08, { scale: new Vec3(0.98, 1.09, 1) })
            .to(0.08, { scale: new Vec3(1, 1, 1) })
            .call(() => {
                if (onComplete) onComplete()
            })
            .start()
    }

    public popStar(onComplete?: () => void): void {
        SoundManager.instance.playSFX(SFX.THREE_STAR)
        this.stars.forEach((starNode) => {
            const starChildNode = starNode.getChildByName('Star')
            if (starChildNode) {
                Tween.stopAllByTarget(starChildNode)
                starChildNode.setScale(0, 0, 1)
                starChildNode.active = true
            }
        })

        const delayBetweenStars = 0.225
        const scaleDuration = 0.45
        let completedCount = 0

        this.stars
            .slice()
            .reverse()
            .forEach((starNode, index) => {
                const starChildNode = starNode.getChildByName('Star')
                const currentDelay = delayBetweenStars * (1 - index * 0.2)
                if (starChildNode) {
                    tween(starChildNode)
                        .delay(currentDelay)
                        .to(scaleDuration, { scale: new Vec3(2.5, 2.5, 1) })
                        .call(() => {
                            completedCount++
                            if (completedCount === this.stars.length && onComplete) {
                                onComplete()
                            }
                        })
                        .start()
                }
            })
    }
    private trailStar() {
        this.stars.forEach((starNode) => {
            const starChildNode = starNode.getChildByName('Star')
            const trail = starChildNode?.getChildByName('Trail')
            if (trail) {
                trail.active = true
            }
        })
    }
    private dropAllStars(onComplete?: () => void): void {
        this.stars.forEach((starNode, index) => {
            const starChildNode = starNode.getChildByName('Star')

            if (starChildNode) {
                tween(starChildNode)
                    .to(0.1, { scale: new Vec3(1.2, 1.2, 1) })
                    .call(() => {
                        if (index === this.stars.length - 1 && onComplete) {
                            onComplete()
                        }
                    })
                    .start()
            }
        })
    }
    private repeatStar(): void {
        this.stars.forEach((starNode, index) => {
            const starChildNode = starNode.getChildByName('Star')

            if (starChildNode && index == 0) {
                tween(starChildNode)
                    .parallel(
                        tween()
                            .to(1.4, { scale: new Vec3(1.2, 1.2, 1) }, { easing: 'sineInOut' })
                            .to(1.4, { scale: new Vec3(1.3, 1.3, 1) }, { easing: 'sineInOut' }),
                        tween().to(1.7, { angle: 2 }).to(1.5, { angle: 5 })
                    )
                    .repeatForever()
                    .start()
            } else if (starChildNode && index == 1) {
                tween(starChildNode)
                    .parallel(
                        tween()
                            .to(1.4, { scale: new Vec3(1.2, 1.2, 1) }, { easing: 'sineInOut' })
                            .to(1.4, { scale: new Vec3(1.3, 1.3, 1) }, { easing: 'sineInOut' }),
                        tween().to(1.7, { angle: 0 }).to(1.5, { angle: 0 })
                    )
                    .repeatForever()
                    .start()
            } else if (starChildNode && index == 2) {
                tween(starChildNode)
                    .parallel(
                        tween()
                            .to(1.4, { scale: new Vec3(1.2, 1.2, 1) }, { easing: 'sineInOut' })
                            .to(1.4, { scale: new Vec3(1.3, 1.3, 1) }, { easing: 'sineInOut' }),
                        tween().to(1.7, { angle: -2 }).to(1.5, { angle: -5 })
                    )
                    .repeatForever()
                    .start()
            }
        })
    }
}
