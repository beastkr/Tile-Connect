import { _decorator, Component, tween, Vec3 } from 'cc'
import { TileConnect } from '../../type/type'
const { ccclass, property } = _decorator

@ccclass('Star')
export class Star extends Component implements TileConnect.IPoolObject {
    private used: boolean = false

    putAt(pos: Vec3) {
        this.node.setPosition(pos)
        tween(this.node)
            .delay(0.8)
            .to(0.5, { position: new Vec3(0, 0, 0) }, { easing: 'quadOut' })
            .delay(0.2)
            .call(() => this.kill())
            .start()
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
        this.used = false
        this.node.active = false
    }
}
