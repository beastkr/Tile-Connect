import { _decorator, Component, Sprite, tween, Vec3 } from 'cc'
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
    putAt(pos: Vec3) {
        this.node.setPosition(pos)
        this.star!.node.active = true
        this.circle!.node.active = false
        AnimationHandler.animList.push(
            new Promise<void>((resolve) => {
                tween(this.node)
                    .delay(0.8)
                    .to(0.5, { position: new Vec3(0, 600, 0) }, { easing: 'quadOut' })
                    .delay(0.2)
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
        this.node.setScale(1, 1)
        this.used = true
        this.node.active = true
    }

    kill(): void {
        this.star!.node.active = false
        this.circle!.node.active = false
        this.used = false
        this.node.active = false
    }
}
