import { _decorator, Component, Size, UITransform, view } from 'cc'
const { ccclass, property } = _decorator

@ccclass('BackGround')
export class BackGround extends Component {
    @property(Boolean)
    scaleOnX: boolean = false

    @property(Boolean)
    scaleOnY: boolean = false

    protected onLoad(): void {
        this.resizeBackground()
        view.on('canvas-resize', this.resizeBackground, this)
    }

    protected onDestroy(): void {
        view.off('canvas-resize', this.resizeBackground, this)
    }

    private resizeBackground(): void {
        const visibleSize = view.getVisibleSize() // Size {width, height}
        const uiTransform = this.node.getComponent(UITransform)

        if (!uiTransform) return

        const currentSize = uiTransform.contentSize
        const newWidth = this.scaleOnX ? visibleSize.width : currentSize.width
        const newHeight = this.scaleOnY ? visibleSize.height : currentSize.height

        uiTransform.setContentSize(new Size(newWidth, newHeight))
    }
}
