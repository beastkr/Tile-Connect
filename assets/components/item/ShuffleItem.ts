import { _decorator } from 'cc'
import Board from '../board/Board'
import BaseItem from './BaseItem'
const { ccclass, property } = _decorator

@ccclass('ShuffleItem')
export class ShuffleItem extends BaseItem {
    onUse(): void {
        if (this.clicked || this.locked) return

        super.onUse()
        if ((this.game?.board as Board).shuffling) return
        ;(this.game?.board as Board).shuffle()

        if (this.quantity > 0) {
            this.quantity -= 1
            this.textChange()
        }
    }
}
