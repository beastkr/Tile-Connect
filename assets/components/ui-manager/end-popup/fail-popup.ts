import { _decorator, Label } from 'cc'
import { BasePopup } from '../basePopup'

const { ccclass, property } = _decorator

@ccclass('Fail')
export class Fail extends BasePopup {
    @property(Label)
    private level!: Label
    public onPopupShow(curr: number): void {
        this.level!.string = `LEVEL ${curr}`
    }
}
