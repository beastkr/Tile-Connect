import { _decorator, Component, Node, Size, UITransform, Vec2 } from 'cc'
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

    private calcDir(): { direction: Vec2; angle: number; length: number } {
        const vec = this.tailCoord.subtract(this.headCoord)
        const direction = vec.normalize()
        const angle = (Math.atan2(direction.y, direction.x) * 180) / Math.PI
        const length = vec.length()
        return { direction, angle, length }
    }

    private updateVisual(target: Node) {
        const { angle, length } = this.calcDir()
        target.angle = -angle

        // Đặt vị trí node tại headCoord (đã là pixel position)
        target.setPosition(this.headCoord.x, this.headCoord.y)

        // Resize chiều dài
        const uiTransform = target.getComponent(UITransform)
        if (uiTransform) {
            const newWidth = length // length đã là pixel
            const currentSize = uiTransform.contentSize
            uiTransform.setContentSize(new Size(newWidth, currentSize.height))
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
        this.node.active = false
    }
}
