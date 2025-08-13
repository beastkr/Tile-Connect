import { _decorator, Color, Component, Node, Sprite, Tween, tween, Vec2, Vec3 } from 'cc'
import { TileConnect } from '../../type/type'
import { AnimationHandler } from '../animation-handler/AnimationHandler'
const { ccclass, property } = _decorator

@ccclass('InvalidPath')
export class InvalidPath extends Component implements TileConnect.IPoolObject {
    private used: boolean = false
    private headCoord: Vec2 = new Vec2()
    private tailCoord: Vec2 = new Vec2()

    public createPath(first: Vec2, second: Vec2, fading: boolean = true) {
        this.headCoord = first
        this.tailCoord = second
        this.updateVisual(this.node, fading)
    }

    private calcDir(): { angle: number; length: number } {
        const vec = this.tailCoord.clone().subtract(this.headCoord.clone())
        const direction = vec.clone().normalize()
        const angle = (Math.atan2(direction.y, direction.x) * 180) / Math.PI
        const length = vec.length()
        return { angle, length }
    }

    public updateVisual(tg: Node, tweening: boolean = true) {
        const target = tg.getChildByName('Path')!
        const sprite = target.getComponent(Sprite)
        const { angle, length } = this.calcDir()
        tg.angle = angle - 90

        tg.setPosition(this.headCoord.x, this.headCoord.y)
        target.setScale(new Vec3(1, length / 12))
        sprite!.color = new Color(255, 255, 255, 255)
        if (tweening) {

            tween(sprite!)
                .delay(0.1)
                .to(0.45, { color: new Color(255, 255, 255, 0) })
                .call(() => {
                    sprite!.color = new Color(255, 255, 255, 255)
                    this.kill()

                })
                .start()

        }
    }

    isUsed(): boolean {
        return this.used
    }

    reSpawn(): void {
        this.used = true
        this.node.active = true
    }

    kill(): void {
        this.used = false
        const target = this.node.getChildByName('Path')
        if (!target?.isValid) return

        const sprite = target.getComponent(Sprite)
        if (!sprite?.isValid) return

        Tween.stopAllByTarget(sprite)
        sprite.color = new Color(255, 255, 255, 0)

        this.node.active = false
    }
}
