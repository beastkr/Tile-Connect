import { _decorator, Component, Node, tween, Vec3 } from 'cc'
const { ccclass, property } = _decorator

@ccclass('RotateStar')
export class RotateStar extends Component {
    start() {
        //  this.rotateLoop()
    }

    rotateLoop(): void {
        tween(this.node)
            .parallel(
                tween().to(0.2, { angle: 4 }).to(1.0, { angle: -4 }).to(0.5, { angle: 0 }),
                tween()
                    .to(0.2, { scale: new Vec3(1.1, 1.1, 1) }, { easing: 'sineInOut' })
                    .to(0.2, { scale: new Vec3(1.2, 1.2, 1) }, { easing: 'sineInOut' })
            )

            .repeatForever()
            .start()
    }
}
