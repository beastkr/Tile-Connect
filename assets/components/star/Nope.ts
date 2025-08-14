import {
    _decorator,
    Component,
    Label,
    Node,
    ParticleSystem2D,
    Sprite,
    tween,
    UITransform,
    Vec3,
} from 'cc'

import { TileConnect } from '../../type/type'
import { AnimationHandler } from '../animation-handler/AnimationHandler'
const { ccclass, property } = _decorator

@ccclass('Nope')
export class Nope extends Component implements TileConnect.IPoolObject {
    private used: boolean = false

    @property(Node)
    dot: Node | null = null
    @property(Node)
    cross: Node | null = null
    @property(Label)
    x: Label | null = null

    putAt(pos: Vec3) {
        this.node.setPosition(pos)
        this.dot!.active = false
        this.cross!.active = true
        this.scheduleOnce(this.kill, 0.5)
    }
    putX(pos: Vec3, i: number) {
        this.node.setPosition(pos)

        this.x!.string = `${i}`
        this.dot!.active = true
        this.cross!.active = false
        this.scheduleOnce(this.kill, 0.5)
    }
    isUsed(): boolean {
        return this.used
    }

    reSpawn(): void {
        this.node.setScale(0.5, 0.5)
        this.used = true
        this.node.active = true
        this.cross!.active = true
        this.dot!.active = true
    }

    kill(): void {
        this.node.scale = new Vec3(0.5, 0.5, 1)
        this.used = false
        this.node.active = false
        this.cross!.active = false
        this.dot!.active = false
    }
}
