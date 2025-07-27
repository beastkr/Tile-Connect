import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Pulse')
export class Pulse extends Component {
    start() {
        this.startPulseEffect()
    }
     startPulseEffect(): void {
           tween(this.node)
            .to(0.4, { scale: new Vec3(0.4, 0.4, 1) }, { easing: 'sineInOut' })
            .to(0.4, { scale: new Vec3(0.3, 0.3, 1) }, { easing: 'sineInOut' })
            .union()
            .repeatForever()
            .start()
    }
    update(deltaTime: number) {
        
    }
}


