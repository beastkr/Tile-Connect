import { _decorator, Color, Component, RichText, Sprite, tween, Vec3 } from 'cc'
import { TileConnect } from '../../type/type'
import GameManager from '../manager/GameManager'
const { ccclass, property } = _decorator

@ccclass('BaseItem')
export class BaseItem extends Component implements TileConnect.IItem {
    @property(Sprite)
    icon: Sprite | null = null
    quantity: number = 10
    @property(RichText)
    protected quantityText: RichText | null = null
    protected clicked: boolean = false
    @property(GameManager)
    protected game: GameManager | null = null

    start() {
        this.textChange()
    }

    onUse(): void {
        const prom: Promise<void>[] = []
        if (this.clicked) return
        this.clicked = true
        prom.push(
            new Promise<void>((resolve) => {
                tween(this.icon!)
                    .to(0.2, { color: new Color(255, 255, 255, 50) })
                    .to(0.2, { color: new Color(255, 255, 255, 255) }, { easing: 'bounceOut' })
                    .call(() => {
                        resolve()
                    })
                    .start()
            })
        )
        prom.push(
            new Promise<void>((resolve) => {
                tween(this.icon!.node)
                    .to(0.2, { scale: new Vec3(0.5, 0.5) })
                    .to(0.2, { scale: new Vec3(1, 1) }, { easing: 'quadOut' })
                    .call(() => {
                        resolve()
                    })
                    .start()
            })
        )
        if (this.quantity == 0) return

        Promise.all(prom).then(() => (this.clicked = false))
    }
    textChange() {
        this.quantityText!.string = String(this.quantity)
    }
}
