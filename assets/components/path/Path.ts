import { _decorator, Color, Component, Node, Sprite, tween, Vec2, Vec3 } from 'cc'
import { TileConnect } from '../../type/type'
const { ccclass, property } = _decorator

@ccclass('Path')
export class Path extends Component implements TileConnect.IPoolObject {
    private used: boolean = false
    private headCoord: Vec2 = new Vec2()
    private tailCoord: Vec2 = new Vec2()

    public createPath(first: Vec2, second: Vec2) {
        this.headCoord = first
        this.tailCoord = second
        this.updateVisual(this.node)
    }

    private calcDir(): { angle: number; length: number } {
        const vec = this.tailCoord.clone().subtract(this.headCoord.clone())
        const direction = vec.clone().normalize()
        const angle = (Math.atan2(direction.y, direction.x) * 180) / Math.PI
        const length = vec.length()
        return { angle, length }
    }

    private updateVisual(target: Node) {
        const sprite = this.node.getComponent(Sprite)
        const { angle, length } = this.calcDir()
        target.angle = angle - 90

        // Đặt vị trí node tại headCoord (đã là pixel position)
        target.setPosition(this.headCoord.x, this.headCoord.y)
        console.log('length: ', length)
        target.setScale(new Vec3(1.5, length / 12))
        // Resize chiều dài
        // const uiTransform = target.getComponent(UITransform)
        // if (uiTransform) {
        //     const newWidth = length // length đã là pixel
        //     const currentSize = uiTransform.contentSize
        //     uiTransform.setContentSize(new Size(newWidth, 500))
        // }
        tween(sprite!)
            .to(0.5, { color: new Color(255, 255, 255, 0) })
            .call(() => {
                sprite!.color = new Color(255, 255, 255, 255)
                this.kill()
            })
            .start()
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
        this.node.active = false
    }
}
