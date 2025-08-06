import { _decorator, Button, Label, Node, Sprite, VideoClip, VideoPlayer } from 'cc'
import { BasePopup } from '../basePopup'
import { UImanager } from '../UImanager'
import { Popup } from 'db://assets/type/global'
import { LevelLoader } from '../../level/LevelLoader'

const { ccclass, property } = _decorator

@ccclass('Continue')
export class Continue extends BasePopup {
    @property(Button)
    private continue: Button | null = null
    @property(Label)
    private countdownlabel: Label | null = null
    @property(Node)
    private fill!: Node
    private timer: number = 5
    private currentTime: number = 0
    private cur: number = 0
    public onPopupShow(curr: number): void {
        const sprite = this.fill.getComponent(Sprite)
        if (sprite) {
            sprite.fillRange = 1
        }
        this.countdownlabel!.string = '5'
        this.cur = curr
    }
    protected update(dt: number): void {
        this.currentTime += dt

        const progress = Math.min(this.currentTime / this.timer, 1)

        const sprite = this.fill.getComponent(Sprite)
        if (sprite) {
            sprite.fillRange = 1 - progress
        }
        const remainingTime = Math.max(0, Math.ceil(this.timer - this.currentTime))
        this.countdownlabel!.string = `${remainingTime}`
        if (this.currentTime >= this.timer) {
            this.onCountdownComplete()
        }
    }
    onCountdownComplete() {
        UImanager.showPopup(
            Popup.FAILPOPUP,
            true,
            LevelLoader.getInstance().getCurrentLevelNumber()
        )
    }
}
