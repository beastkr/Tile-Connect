import { _decorator, Component, Node, tween } from 'cc'
const { ccclass, property } = _decorator

@ccclass('Rotate')
export class Rotate extends Component {
    start() {
        this.rotate()
    }

    private rotate() {
        tween(this.node).by(1.5, { angle: 360 }).repeatForever().start()
    }
}
