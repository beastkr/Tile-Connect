import { _decorator, Component } from 'cc'
import { Item } from '../../type/global'
import BaseItem from '../item/BaseItem'
import GameManager from './GameManager'
const { ccclass, property } = _decorator

@ccclass('ItemManager')
export class ItemManager extends Component {
    game: GameManager | null = null
    itemList: Map<Item, BaseItem> = new Map<Item, BaseItem>()
    protected onLoad(): void {
        this.cacheAllItem()
        // this.intialize()
    }
    intialize(game?: GameManager) {
        console.log(this.itemList)
        if (game) this.game = game
        console.log('DONE INIT, GAME MANAGER: ', game)
        for (const item of this.itemList) {
            const QUANTITY = Number(localStorage.getItem(item[0]))
            if (QUANTITY == 0) localStorage.setItem(item[0], '0')
            console.log(QUANTITY)
            item[1].setquantity(QUANTITY)
            item[1].init()
            if (game) {
                item[1].game = this.game
                console.log('init item: ', item[1], item[1].game)
            }
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
    useShuffle() {
        this.useItem(Item.SHUFFLE)
    }
    useRocket() {
        this.useItem(Item.ROCKET)
    }

    unlockItem(itemType: Item) {
        this.itemList.get(itemType)?.unlock()
    }
    lockItem(itemType: Item) {
        this.itemList.get(itemType)?.lock()
    }

    lockAll() {
        this.itemList.forEach((item) => {
            item.lock()
        })
    }
    unlockAll() {
        this.itemList.forEach((item) => {
            item.unlock()
        })
    }
}
