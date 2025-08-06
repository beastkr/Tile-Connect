import { _decorator, Button, Label, Node, VideoClip, VideoPlayer } from 'cc'
import { BasePopup } from '../basePopup'

const { ccclass, property } = _decorator

@ccclass('Ads')
export class Ads extends BasePopup {
    @property(Node)
    private clip: Node | null = null
    @property(Button)
    private continue: Button | null = null
    @property(Button)
    private cancel: Button | null = null
    private timer: number = 0
    public onPopupShow(curr: number): void {
        const clip = this.clip?.getComponent(VideoPlayer)
        if (clip) {
            clip.currentTime = 0
            clip.play()
        }
        this.cancel!.node.active = true
        this.continue!.node.active = false
    }
    protected update(dt: number): void {
        this.timer += dt
        const clip = this.clip?.getComponent(VideoPlayer)?.duration
        if (clip && this.timer >= clip) {
            this.continue!.node.active = true
            this.cancel!.node.active = false
        }
    }
}
