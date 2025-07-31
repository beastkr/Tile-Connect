import { _decorator, Button, Node, Label, Sprite, tween, Vec3, Prefab, instantiate } from 'cc'
import { BasePopup } from '../basePopup'
import { UImanager } from '../UImanager'
import { Popup } from '../../../type/global'

const { ccclass, property } = _decorator

@ccclass('Fail')
export class Fail extends BasePopup {
    @property(Label)
    private level!: Label
    public onPopupShow(curr: number): void {
        this.level!.string = `LEVEL ${curr}`
    }
}
