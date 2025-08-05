import { _decorator, Component, Node, ParticleSystem2D, Sprite, tween, UITransform, Vec3 } from 'cc'

import { TileConnect } from '../../type/type'
import { AnimationHandler } from '../animation-handler/AnimationHandler'
const { ccclass, property } = _decorator

@ccclass('Star')
export class Star extends Component implements TileConnect.IPoolObject {
    private used: boolean = false
    @property(Sprite)
    circle: Sprite | null = null
    @property(Sprite)
    star: Sprite | null = null
    @property(Node)
    match: Node | null = null
    @property(Node)
    trail: Node | null = null
    @property(Node)
    death: Node | null = null

    putAt(pos: Vec3) {
        this.node.setPosition(pos)
        this.star!.node.active = true
        this.circle!.node.active = false
        //

        const targetStar = AnimationHandler.fillProgressBar?.currentStar
        if (!targetStar) return
        const worldPos = targetStar.getWorldPosition()
        const localPos =
            this.node.parent?.getComponent(UITransform)?.convertToNodeSpaceAR(worldPos) || worldPos

        AnimationHandler.animList.push(
            new Promise<void>((resolve) => {
                tween(this.node)
                    .delay(0.8)
                    .call(() => {
                        this.follow()
                    })
                    .to(
                        0.4,
                        { position: localPos, scale: new Vec3(2, 2, 1) },
                        { easing: 'quadOut' }
                    )
                    .call(() => {
                        AnimationHandler.callProgress()
                        this.trail!.active = false
                    })
                    .delay(0.1)
                    .call(() => {
                        this.explode()
                    })
                    .delay(0.5)
                    .call(() => {
                        this.kill()
                        resolve()
                    })
                    .start()
            })
        )
    }
    putAtForHint(pos: Vec3) {
        this.star!.node.active = false
        this.node.setPosition(pos)
        this.circle!.node.active = true
    }

    isUsed(): boolean {
        return this.used
    }

    reSpawn(): void {
        this.node.setScale(1.5, 1.5)
        this.used = true
        this.node.active = true
    }

    kill(): void {
        this.death!.active = false
        this.trail!.active = false
        this.node.scale = new Vec3(1, 1, 1)

        this.star!.node.active = false
        this.match!.active = false
        this.circle!.node.active = false
        this.used = false
        this.node.active = false
    }
    firstAndLastMatch() {
        this.match!.active = true
        this.match?.getComponent(ParticleSystem2D)?.resetSystem()
    }
    explode() {
        this.death!.active = true
        this.star!.node.active = false
        this.death?.getComponent(ParticleSystem2D)?.resetSystem()
        AnimationHandler.fillProgressBar?.checkActive()
    }
    follow() {
        this.trail!.active = true
        this.trail?.getComponent(ParticleSystem2D)?.resetSystem()
    }
    winPut(clockWorldPos: Vec3) {
        this.star!.node.active = true
        this.circle!.node.active = false

        this.node.setWorldPosition(clockWorldPos)
        this.follow()

        const targetStar = AnimationHandler.fillProgressBar?.currentStar
        if (!targetStar) return

        const targetWorldPos = targetStar.getWorldPosition()

        const startPos = clockWorldPos
        const endPos = targetWorldPos

        const controlPoint1 = new Vec3(
            startPos.x + (endPos.x - startPos.x) * 0.3,
            startPos.y - 80,
            0
        )
        const controlPoint2 = new Vec3(startPos.x + (endPos.x - startPos.x) * 0.7, endPos.y - 60, 0)

        AnimationHandler.animList.push(
            new Promise<void>((resolve) => {
                let progress = 0

                tween({ t: 0 })
                    .to(
                        0.7,
                        { t: 1 },
                        {
                            onUpdate: (target) => {
                                if (!target) return

                                const t = target.t

                                const x =
                                    Math.pow(1 - t, 3) * startPos.x +
                                    3 * Math.pow(1 - t, 2) * t * controlPoint1.x +
                                    3 * (1 - t) * Math.pow(t, 2) * controlPoint2.x +
                                    Math.pow(t, 3) * endPos.x

                                const y =
                                    Math.pow(1 - t, 3) * startPos.y +
                                    3 * Math.pow(1 - t, 2) * t * controlPoint1.y +
                                    3 * (1 - t) * Math.pow(t, 2) * controlPoint2.y +
                                    Math.pow(t, 3) * endPos.y

                                const currentPos = new Vec3(x, y, 0)
                                this.node.setWorldPosition(currentPos)

                                const scale = 1 + t
                                this.node.setScale(scale, scale, 1)
                            },
                            easing: 'quadOut',
                        }
                    )
                    .call(() => {
                        this.kill()
                        resolve()
                    })
                    .start()
            })
        )
    }
}
