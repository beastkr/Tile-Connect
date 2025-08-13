import { _decorator, Color, Component, Node, Sprite, Tween, tween, Vec2, Vec3 } from 'cc'
import { TileConnect } from '../../type/type'
import { AnimationHandler } from '../animation-handler/AnimationHandler'
const { ccclass, property } = _decorator

@ccclass('Path')
export class Path extends Component implements TileConnect.IPoolObject {
    used: boolean = false
    private headCoord: Vec2 = new Vec2()
    private tailCoord: Vec2 = new Vec2()

    // @property(Node)
    // tailNode: Node | null = null
    // @property(Node)
    // tailPoint: Node | null = null
    // @property(Node)
    // headNode: Node | null = null

    // showHeadTail() {
    //     this.tailNode!.active = true
    //     this.headNode!.active = true
    // }
    // hideHeadTail() {
    //     this.tailNode!.active = false
    //     this.headNode!.active = false
    // }
    public createPath(first: Vec2, second: Vec2, fading: boolean = true, duration: number = 0.2) {
        this.headCoord = first
        this.tailCoord = second
        this.updateVisual(this.node, fading, duration)
        // if (!fading) {
        //     this.showHeadTail()
        //     this.tailNode?.setWorldPosition(this.tailPoint?.getWorldPosition()!)
        // }
    }

    private calcDir(): { angle: number; length: number } {
        const vec = this.tailCoord.clone().subtract(this.headCoord.clone())
        const direction = vec.clone().normalize()
        const angle = (Math.atan2(direction.y, direction.x) * 180) / Math.PI
        const length = vec.length()
        return { angle, length }
    }

    public updateVisual(tg: Node, tweening: boolean = true, duration: number = 0.2) {
        this.node.setSiblingIndex(2000)
        const target = tg.getChildByName('Path')!
        const sprite = target.getComponent(Sprite)
        const { angle, length } = this.calcDir()
        tg.angle = angle - 90

        // Đặt vị trí node tại headCoord (đã là pixel position)
        tg.setPosition(this.headCoord.x, this.headCoord.y)
        console.log('length: ', length)
        target.setScale(new Vec3(length / 36, 1))
        // Resize chiều dài
        // const uiTransform = target.getComponent(UITransform)
        // if (uiTransform) {
        //     const newWidth = length // length đã là pixel
        //     const currentSize = uiTransform.contentSize
        //     uiTransform.setContentSize(new Size(newWidth, 500))
        // }
        sprite!.color = new Color(255, 255, 255, 255)
        if (tweening) {

            tween(sprite!)
                .delay(0.1)
                .to(duration, { color: new Color(255, 255, 255, 0) })
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
