import { _decorator, Component } from 'cc'
import { Item } from '../../type/global'
import BaseItem from '../item/BaseItem'
const { ccclass, property } = _decorator

@ccclass('ItemManager')
export class ItemManager extends Component {
    itemList: Map<Item, BaseItem> = new Map<Item, BaseItem>()
    protected start(): void {
        this.cacheAllItem()
        this.intialize()
    }
    intialize() {
        for (const item of this.itemList) {
            const QUANTITY = Number(localStorage.getItem(item[0]))
            if (QUANTITY == 0) localStorage.setItem(item[0], '0')
            console.log(QUANTITY)
            item[1].setquantity(QUANTITY)
            item[1].init()
        }
    }
    cacheAllItem() {
        Object.values(Item).forEach((itemType) => {
            const node = this.node.getChildByName(itemType)
            if (node) this.itemList.set(itemType, node.getComponent(BaseItem)!)
            console.log('cached: ', itemType)
        })
    }
    useItem(itemType: Item) {
        const item = this.itemList.get(itemType)
        item?.onUse()
        if (item?.quantity == 0) item.lock()
        localStorage.setItem(itemType, String(item?.quantity))
    }

    useHint() {
        this.useItem(Item.HINT)
        this.itemList.get(Item.HINT)?.lock()
    }

    useBoom() {
        this.useItem(Item.BOOM)
    }

    unlockItem(itemType: Item) {
        this.itemList.get(itemType)?.unlock()
    }
}
