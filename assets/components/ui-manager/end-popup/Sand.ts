import { _decorator, Component, Node, repeat, tween } from 'cc'
const { ccclass, property } = _decorator

@ccclass('Sand')
export class Sand extends Component {
    start() {
        this.rotate()
    }

    private rotate() {
        tween(this.node)
            .repeatForever(
                tween()
                    .to(0.5, { angle: 180 })
                    .delay(0.3)
                    .call(() => (this.node.angle = 0))
                    .delay(0.2)
            )

            .start()
    }
}
