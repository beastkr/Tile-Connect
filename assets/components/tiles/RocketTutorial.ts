import { _decorator, Component, Node, tween, UIOpacity, Vec3 } from 'cc'
const { ccclass, property } = _decorator

@ccclass('RocketTutorial')
export class RocketTutorial extends Component {
    @property(Node)
    private topRocket: Node | null = null
    @property(Node)
    private BotRocket: Node | null = null
    @property([Node])
    private listTile: Node[] = []

    start() {
        this.startAnimation()
    }

    startAnimation() {
        this.topAnim()
        this.botAnim()
    }
    topAnim() {
        const startPos = this.topRocket!.position
        const endPos = this.listTile[1].position
        const startAngle = this.topRocket!.angle
        const controlPoint1 = new Vec3(
            startPos.x + (endPos.x - startPos.x) * 0.3,
            startPos.y + 80,
            0
        )
        const controlPoint2 = new Vec3(startPos.x + (endPos.x - startPos.x) * 0.7, endPos.y + 60, 0)

        tween({ t: 0 })
            .to(
                0.7,
                { t: 1 },
                {
                    onUpdate: (target) => {
                        if (!target) return
                        const t = target.t

                        const x =
                            Math.pow(1 - t, 3) * startPos.x +
                            3 * Math.pow(1 - t, 2) * t * controlPoint1.x +
                            3 * (1 - t) * Math.pow(t, 2) * controlPoint2.x +
                            Math.pow(t, 3) * endPos.x

                        const y =
                            Math.pow(1 - t, 3) * startPos.y +
                            3 * Math.pow(1 - t, 2) * t * controlPoint1.y +
                            3 * (1 - t) * Math.pow(t, 2) * controlPoint2.y +
                            Math.pow(t, 3) * endPos.y

                        const currentPos = new Vec3(x, y, 0)
                        this.topRocket!.position = new Vec3(currentPos)

                        const currentAngle = startAngle - -154 * t
                        this.topRocket!.angle = currentAngle
                    },
                }
            )
            .call(() => {
                this.fade(this.listTile[1].getComponent(UIOpacity)!)
            })
            .start()
        this.fade(this.listTile[0].getComponent(UIOpacity)!)
    }
    botAnim() {
        const startPos = this.BotRocket!.position
        const endPos = this.listTile[3].position
        const startAngle = this.BotRocket!.angle
        const controlPoint1 = new Vec3(
            startPos.x + (endPos.x - startPos.x) * 0.3,
            startPos.y - 80,
            0
        )
        const controlPoint2 = new Vec3(startPos.x + (endPos.x - startPos.x) * 0.7, endPos.y - 60, 0)

        tween({ t: 0 })
            .to(
                0.7,
                { t: 1 },
                {
                    onUpdate: (target) => {
                        if (!target) return
                        const t = target.t

                        const x =
                            Math.pow(1 - t, 3) * startPos.x +
                            3 * Math.pow(1 - t, 2) * t * controlPoint1.x +
                            3 * (1 - t) * Math.pow(t, 2) * controlPoint2.x +
                            Math.pow(t, 3) * endPos.x

                        const y =
                            Math.pow(1 - t, 3) * startPos.y +
                            3 * Math.pow(1 - t, 2) * t * controlPoint1.y +
                            3 * (1 - t) * Math.pow(t, 2) * controlPoint2.y +
                            Math.pow(t, 3) * endPos.y

                        const currentPos = new Vec3(x, y, 0)
                        this.BotRocket!.position = new Vec3(currentPos)

                        const currentAngle = startAngle - 90 * t
                        this.BotRocket!.angle = currentAngle
                    },
                }
            )
            .call(() => {
                this.fade(this.listTile[3].getComponent(UIOpacity)!)
            })
            .start()
        this.fade(this.listTile[2].getComponent(UIOpacity)!)
    }
    fade(uiOpacity: UIOpacity) {
        tween(uiOpacity).to(0.6, { opacity: 0 }, { easing: 'quadOut' }).start()
    }

    update(deltaTime: number) {}
}
