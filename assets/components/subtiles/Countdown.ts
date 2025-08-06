import { _decorator, Animation, Component, director, find, Node, Sprite } from 'cc'
const { ccclass, property } = _decorator
export const GAME_EVENTS = {
    COUNTDOWN_COMPLETE: 'countdown-complete',
    GAME_OVER: 'game-over',
    LEVEL_WIN: 'level-win',
    COUNTDOWN_RESET: 'countdown-reset',
}

@ccclass('Countdown')
export class Countdown extends Component {
    private timer: number = 3

    private currentTime: number = 0
    @property(Node)
    private bom: Node | null = null

    start() {
        const sprite = this.node.getComponent(Sprite)
        if (sprite) {
            sprite.fillRange = -1
        }
        director.on(GAME_EVENTS.COUNTDOWN_RESET, this.setActive, this)
    }

    update(deltaTime: number) {
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
        this.node.parent!.active = false
    }
    public setActive() {
        this.node.parent!.active = true
    }
    private playAnimation() {
        this.bom!.active = true
        const originalParent = this.bom!.parent
        const originalPosition = this.bom!.worldPosition

        const topParent = find('Canvas') || this.node.scene
        this.bom!.setParent(topParent)
        this.bom!.worldPosition = originalPosition

        const animComp = this.bom!.getComponent(Animation)
        if (animComp) {
            animComp.play()
            console.log(originalPosition)

            animComp.once(Animation.EventType.FINISHED, () => {
                this.bom!.active = false
                this.bom!.setParent(originalParent)
                this.bom!.worldPosition = originalPosition
                this.scheduleOnce(() => {
                    director.emit(GAME_EVENTS.COUNTDOWN_COMPLETE)
                }, 0.5)
            })
        }
    }
    public resetCountdown() {
        this.currentTime = 0
        const sprite = this.node.getComponent(Sprite)
        if (sprite) {
            sprite.fillRange = -1
        }
        this.enabled = true
        //  this.node.parent!.active = true
    }

    public setCountdownTime(newTime: number) {
        this.timer = newTime
        this.resetCountdown()
    }
}
