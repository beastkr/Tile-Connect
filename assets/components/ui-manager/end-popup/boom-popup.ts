import { _decorator, Label } from 'cc'
import { BasePopup } from '../basePopup'

const { ccclass, property } = _decorator

@ccclass('BoomFail')
export class BoomFail extends BasePopup {
    @property(Label)
    private level!: Label
    public onPopupShow(curr: number): void {
        this.level!.string = `LEVEL ${curr}`
    }
}
