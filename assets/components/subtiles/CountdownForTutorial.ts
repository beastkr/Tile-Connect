import { _decorator, Animation, Component, director, find, Node, Sprite, tween, Vec3 } from 'cc'
const { ccclass, property } = _decorator
import { TileConnect } from '../../type/type'

@ccclass('Countdown')
export class Countdown extends Component {
    private timer: number = 3
    private currentTime: number = 0
    @property(Node)
    private fail: Node | null = null
    @property(Node)
    private wing: Node | null = null
    start() {
        const sprite = this.node.getComponent(Sprite)
        if (sprite) {
            sprite.fillRange = -1
        }
        this.enabled = true
        this.fail!.active = false
        this.wing!.active = false
        this.fail!.scale = new Vec3(0, 0, 1)
        this.wing!.scale = new Vec3(0, 0, 1)
    }
    reset() {
        this.enabled = true

        this.fail!.active = false
        this.wing!.active = false
        this.fail!.scale = new Vec3(0, 0, 1)
        this.wing!.scale = new Vec3(0, 0, 1)
        this.resetCountdown()
    }
    update(deltaTime: number) {
        if (!this.enabled) return
        this.currentTime += deltaTime

        const progress = Math.min(this.currentTime / this.timer, 1)

        const sprite = this.node.getComponent(Sprite)
        if (sprite) {
            sprite.fillRange = -1 + progress
        }

        if (this.currentTime >= this.timer) {
            this.onCountdownComplete()
        }
    }

    private onCountdownComplete() {
        this.enabled = false
        this.playAnimation()
        this.resetCountdown()
    }

    public resetToInitialState() {
        this.enabled = false
        this.node.parent!.active = true
        this.currentTime = 0
        const sprite = this.node.getComponent(Sprite)
        if (sprite) {
            sprite.fillRange = -1
        }
    }

    public startCountdown() {
        this.enabled = true
        this.node.parent!.active = true
    }

    private playAnimation() {
        this.fail!.active = true
        this.wing!.active = true
        tween(this.fail!)
            .to(0.5, { scale: new Vec3(0.5, 0.5, 1) })
            .delay(0.2)
            .call(() => {
                tween(this.wing!)
                    .to(0.5, { scale: new Vec3(1, 1, 1) })
                    .delay(0.2)
                    .call(() => {
                        this.reset()
                    })
                    .start()
            })
            .start()
    }

    public resetCountdown() {
        this.currentTime = 0
        const sprite = this.node.getComponent(Sprite)
        if (sprite) {
            sprite.fillRange = -1
        }
    }

    public setCountdownTime(newTime: number) {
        this.timer = newTime
        this.resetToInitialState()
    }

    protected onDestroy(): void {
        director.off(TileConnect.GAME_EVENTS.COUNTDOWN_RESET, this.resetToInitialState, this)
        director.off(TileConnect.GAME_EVENTS.START_COUNTDOWN, this.startCountdown, this)
    }
}
