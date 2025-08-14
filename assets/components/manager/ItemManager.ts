import { _decorator, Component, Node } from 'cc'
import { Item } from '../../type/global'
import BaseItem from '../item/BaseItem'
import GameManager from './GameManager'
const { ccclass, property } = _decorator

@ccclass('ItemManager')
export class ItemManager extends Component {
    game: GameManager | null = null
    itemList: Map<Item, BaseItem> = new Map<Item, BaseItem>()
    @property(Node)
    bg: Node | null = null
    @property(Node)
    botOverlay: Node | null = null
    @property(Node)
    skipButton: Node | null = null

    protected onLoad(): void {
        this.cacheAllItem()
        // this.intialize()
    }
    hideExcept(item: Item) {
        // this.bg!.active = false
        for (const i of this.itemList) {
            if (i[0] != item) i[1].fade(true)
        }
    }
    hideAll() {
        for (const i of this.itemList) {
            i[1].node.active = false
        }
    }
    showItem(item: Item) {
        this.bg!.active = true

        for (const i of this.itemList) {
            if (i[0] == item) i[1].node.active = true
        }
    }
    showAll() {
        this.bg!.active = true
        for (const i of this.itemList) {
            i[1].fade(false)
        }
    }
    intialize(game?: GameManager) {
        console.log(this.itemList)
        if (game) this.game = game
        console.log('DONE INIT, GAME MANAGER: ', game)
        for (const item of this.itemList) {
            var QUANTITY = Number(localStorage.getItem(item[0]))
            if (!localStorage.getItem(item[0])) QUANTITY = 10
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
            node!.getComponent(BaseItem)!.itemManager = this
            node!.getComponent(BaseItem)!.itemName = itemType
            if (node) this.itemList.set(itemType, node.getComponent(BaseItem)!)
            console.log('cached: ', itemType)
        })
    }
    useItem(itemType: Item) {
        if (this.game?.isgameOver) return
        const item = this.itemList.get(itemType)
        item?.onUse()
        // item?.stopFunction()
        if (item?.quantity == 0) {
            item.stopFunction()
            item.needToAds()
        }
        localStorage.setItem(itemType, String(item?.quantity))
    }

    useHint() {
        this.useItem(Item.HINT)
        this.itemList.get(Item.HINT)?.stopFunction()
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
    useSuperRocket() {
        this.useItem(Item.SUPERROCKET)
    }

    unlockItem(itemType: Item) {
        this.itemList.get(itemType)?.enableFunction()
    }
    lockItem(itemType: Item) {
        this.itemList.get(itemType)?.stopFunction()
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
