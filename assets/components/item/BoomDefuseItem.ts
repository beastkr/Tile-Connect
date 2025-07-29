import { _decorator } from 'cc'
import { SubType } from '../../type/global'
import Tile from '../tiles/Tile'
import { BaseItem } from './BaseItem'
const { ccclass, property } = _decorator

@ccclass('BoomDefuseItem')
export class BoomDefuseItem extends BaseItem {
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
        }
    }
}
