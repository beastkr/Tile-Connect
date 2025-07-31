import { _decorator, Component, Node } from 'cc'
const { ccclass } = _decorator

@ccclass('BasePopup')
export abstract class BasePopup extends Component {
    public onPopupShow(curr?: number): void {}

    public onPopupHide(): void {}

    public onPopupDestroy(): void {}

    protected closePopup(): void {}
}
