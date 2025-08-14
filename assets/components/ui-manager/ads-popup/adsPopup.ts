import { _decorator, Button, director, Label, Node, Sprite, VideoClip, VideoPlayer } from 'cc'
import { BasePopup } from '../basePopup'
import { TileConnect } from '../../../type/type'

const { ccclass, property } = _decorator

@ccclass('Ads')
export class Ads extends BasePopup {
    @property(Label)
    private countdownlabel: Label | null = null
    @property(Node)
    private fill!: Node
    @property(Node)
    private clip!: Node
    private timer: number = 5
    private currentTime: number = 0
    public onPopupShow(curr: number): void {
        this.clip!.getComponent(VideoPlayer)?.play()
        const sprite = this.fill.getComponent(Sprite)
        if (sprite) {
            sprite.fillRange = 1
        }
    }
    protected update(dt: number): void {
        this.currentTime += dt

        const progress = Math.min(this.currentTime / this.timer, 1)

        const sprite = this.fill.getComponent(Sprite)
        if (sprite) {
            sprite.fillRange = 1 - progress
        }
        if (this.currentTime >= this.timer) {
            this.onCountdownComplete()
        }
    }
    onCountdownComplete() {
        this.countdownlabel!.node.active = true
    }
    public onPopupHide(): void {
        this.countdownlabel!.node.active = false
        const sprite = this.fill.getComponent(Sprite)
        if (sprite) {
            sprite.fillRange = 1
        }
        director.emit(TileConnect.GAME_EVENTS.COUNTDOWN_RESET)

        this.currentTime = 0
    }
}
