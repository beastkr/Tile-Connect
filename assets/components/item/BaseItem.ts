import { _decorator, Button, Color, Component, director, EventHandler, Node, RichText, Sprite, tween, Vec3 } from 'cc'
import { TileConnect } from '../../type/type'
import GameManager from '../manager/GameManager'
import { ItemManager } from '../manager/ItemManager'
import { Turn } from '../../type/global'
import { UImanager } from '../ui-manager/UImanager'
const { ccclass, property } = _decorator

@ccclass('BaseItem')
class BaseItem extends Component implements TileConnect.IItem {
    @property(Sprite)
    icon: Sprite | null = null
    @property(Sprite)
    BG: Sprite | null = null
    mainBG: Sprite | null = this.BG
    mainIcon: Sprite | null = this.icon
    quantity: number = 0
    @property(RichText)
    protected quantityText: RichText | null = null
    protected clicked: boolean = false
    itemManager: ItemManager | null = null
    public game: GameManager | null = null
    @property(Sprite)
    lockedIcon: Sprite | null = null
    @property(Sprite)
    lockedBG: Sprite | null = null
    locked: boolean = false
    @property(Node)
    note: Node | null = null
    @property(Node)
    noteLock: Node | null = null
    itemName: string = 'name'
    currentNote: Node | null = this.note
    protected item: string = 'UseItem'
    start() {
        // this.quantity = 10
        // this.init()
    }
    setquantity(n: number) {
        this.quantity = n
        localStorage.setItem(this.itemName, String(this.quantity))
        this.init()

    }
    protected update(dt: number): void {
        if (this.quantity == 0) this.needToAds()
    }

    fade(toZero: boolean = true) {
        const opacity = toZero ? 0 : 255
        const duration = 0.2
        if (this.currentNote) this.currentNote.active = !toZero
        tween(this.mainBG!)
            .to(duration, { color: new Color(255, 255, 255, opacity) })
            .call(() => {
                this.node.active = !toZero
            })
            .start()
        tween(this.mainIcon!)
            .to(duration, { color: new Color(255, 255, 255, opacity) })
            .start()
    }

    needToAds() {
        this.quantityText!.string = 'ADS';
        this.currentNote!.active = true;




        const btn = this.node.getComponent(Button);
        if (btn) {
            btn.clickEvents.length = 0; // clear old events
            const eventHandler = new EventHandler();
            eventHandler.target = this.node; // or another node that has the ads logic
            eventHandler.component = 'BaseItem'; // script name
            eventHandler.handler = 'AdsPop'; // method to run
            btn.clickEvents.push(eventHandler);
        }
    }

    AdsPop() {
        this.game!.ispause = true
        this.game?.adsPop()
        const btn = this.itemManager?.skipButton!.getComponent(Button);
        if (btn) {
            btn.clickEvents.length = 0; // clear old events
            const eventHandler = new EventHandler();
            eventHandler.target = this.node; // or another node that has the ads logic
            eventHandler.component = 'BaseItem'; // script name
            eventHandler.handler = 'increase'; // method to run
            btn.clickEvents.push(eventHandler);
        }
    }

    increase() {
        this.setquantity(1)
        localStorage.setItem(this.itemName, String(this.quantity))
        this.init()
        this.game!.ispause = false
        this.game!.isgameOver = false
        UImanager.hideAllPopups()
        UImanager.togglePauseButton(true)
        // director.emit(TileConnect.GAME_EVENTS.COUNTDOWN_RESET)
        director.emit(TileConnect.GAME_EVENTS.START_COUNTDOWN)

        this.game!.turnOnInput()
        this.game!.switchTurn(Turn.START)
        const btn = this.node.getComponent(Button);
        if (btn) {
            btn.clickEvents.length = 0; // clear old events
            const eventHandler = new EventHandler();
            eventHandler.target = this.itemManager!.node; // or another node that has the ads logic
            eventHandler.component = 'ItemManager'; // script name
            eventHandler.handler = this.item; // method to run
            btn.clickEvents.push(eventHandler);
        }
    }


    init() {
        this.textChange()
        this.lock()
        this.unlock()
        if (this.quantity == 0) this.stopFunction()
        else this.enableFunction()
    }

    onUse(): void {
        if (this.locked) return
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
    stopFunction() {
        this.locked = true
        this.currentNote!.active = false
    }
    enableFunction() {
        this.locked = false
        this.currentNote!.active = true
    }

    lock() {
        this.locked = true
        if (this.mainBG && this.mainIcon && this.currentNote) {
            this.mainBG.node.active = false
            this.mainIcon.node.active = false
            this.currentNote.active = false
        }

        this.mainIcon = this.lockedIcon
        this.mainBG = this.lockedBG
        this.currentNote = this.noteLock
        if (this.mainBG && this.mainIcon && this.currentNote) {
            this.mainBG.node.active = true
            this.mainIcon.node.active = true
            this.currentNote.active = true
        }
    }

    unlock() {
        this.locked = false
        if (this.mainBG && this.mainIcon && this.currentNote) {
            this.mainBG.node.active = false
            this.mainIcon.node.active = false
            this.currentNote.active = false
        }
        this.mainIcon = this.icon
        this.mainBG = this.BG
        this.currentNote = this.note
        if (this.mainBG && this.mainIcon && this.currentNote) {
            this.mainBG.node.active = true
            this.mainIcon.node.active = true
            this.currentNote.active = true
        }
    }
}

export default BaseItem
