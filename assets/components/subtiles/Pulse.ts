import { _decorator, Component, Node, tween, Vec3 } from 'cc'
const { ccclass, property } = _decorator

@ccclass('Pulse')
export class Pulse extends Component {
    @property
    private frstscale: number = 0
    @property
    private scndscale: number = 0
    @property
    private time: number = 0
    start() {
        this.startPulseEffect()
    }
    startPulseEffect(): void {
        tween(this.node)
            .to(
                this.time,
                { scale: new Vec3(this.frstscale, this.frstscale, 1) },
                { easing: 'sineInOut' }
            )
            .to(
                this.time,
                { scale: new Vec3(this.scndscale, this.scndscale, 1) },
                { easing: 'sineInOut' }
            )
            .union()
            .repeatForever()
            .start()
    }
    update(deltaTime: number) {}
}
