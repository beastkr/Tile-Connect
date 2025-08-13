import { _decorator, Animation, Vec3 } from 'cc'
import { SubType } from '../../type/global'
import Tile from '../tiles/Tile'
import BaseItem from './BaseItem'
const { ccclass, property } = _decorator

@ccclass('BoomDefuseItem')
export class BoomDefuseItem extends BaseItem {
    protected item: string = 'useBoom'
    @property(Animation)
    anim: Animation | null = null
    onUse(): void {
        if (this.clicked) return
        const t: Tile[] = []
        for (const row of this.game!.board!.board as Tile[][]) {
            t.push(...row.filter((tile) => tile.getSubtileList().has(SubType.BOOM)))
        }
        super.onUse()

        if (t.length > 0 && this.quantity > 0) {
            this.quantity -= 1
            this.textChange()

            t[0].detachSubType(SubType.BOOM)
            this.anim!.node.active = true
            this.anim!.node.setWorldPosition(t[0].node.worldPosition)
            t[0].itemTypeSprite!.node.setScale(new Vec3(0))
            this.anim?.play()
            this.anim?.once(Animation.EventType.FINISHED, () => {
                this.anim!.node.active = false
                t[0].shrink()
            })
        }
    }
}
