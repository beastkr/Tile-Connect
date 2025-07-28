import { _decorator, Color, Component, RichText, Sprite, tween, Vec3 } from 'cc'
import { TileConnect } from '../../type/type'
const { ccclass, property } = _decorator

@ccclass('BaseItem')
export class BaseItem extends Component implements TileConnect.IItem {
    @property(Sprite)
    icon: Sprite | null = null
    quantity: number = 10
    @property(RichText)
    protected quantityText: RichText | null = null
    protected clicked: boolean = false

    start() {
        this.textChange()
    }

    onUse(): void {
        if (this.clicked) return
        this.clicked = true
        tween(this.icon!)
            .to(0.2, { color: new Color(255, 255, 255, 50) })
            .to(0.2, { color: new Color(255, 255, 255, 255) }, { easing: 'bounceOut' })
            .call(() => {
                this.clicked = false
            })
            .start()
        tween(this.icon!.node)
            .to(0.2, { scale: new Vec3(0.5, 0.5) })
            .to(0.2, { scale: new Vec3(1, 1) }, { easing: 'quadOut' })
            .call(() => {
                this.clicked = false
            })
            .start()
        if (this.quantity == 0) return

        this.quantity -= 1
        this.textChange()
    }
    textChange() {
        this.quantityText!.string = String(this.quantity)
    }
}
