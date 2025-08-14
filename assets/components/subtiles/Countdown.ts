import { _decorator, Animation, Component, director, find, Node, Sprite } from 'cc'
import { SoundManager } from '../manager/SoundManager'
import { SFX } from '../../type/global'
const { ccclass, property } = _decorator
import { TileConnect } from '../../type/type'

@ccclass('Countdown')
export class Countdown extends Component {
    private timer: number = 40
    private currentTime: number = 0
    @property(Node)
    private bom: Node | null = null

    start() {
        const sprite = this.node.getComponent(Sprite)
        if (sprite) {
            sprite.fillRange = -1
        }
        this.enabled = false

        director.on(TileConnect.GAME_EVENTS.COUNTDOWN_RESET, this.resetToInitialState, this)
        director.on(TileConnect.GAME_EVENTS.START_COUNTDOWN, this.startCountdown, this)
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
        SoundManager.instance.playSFX(SFX.EXPLODE)
        this.playAnimation()
        this.resetCountdown()
        this.node.parent!.active = false
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
                    director.emit(TileConnect.GAME_EVENTS.COUNTDOWN_COMPLETE)
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
