import { _decorator, Color, Component, Node, RichText, Sprite, tween, Vec3 } from 'cc'
import { TileConnect } from '../../type/type'
import GameManager from '../manager/GameManager'
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
    @property(GameManager)
    protected game: GameManager | null = null
    @property(Sprite)
    lockedIcon: Sprite | null = null
    @property(Sprite)
    lockedBG: Sprite | null = null
    locked: boolean = false
    @property(Node)
    note: Node | null = null
    @property(Node)
    noteLock: Node | null = null
    currentNote: Node | null = this.note
    start() {
        // this.quantity = 10
        // this.init()
    }
    setquantity(n: number) {
        this.quantity = n
    }

    init() {
        this.textChange()
        this.lock()
        this.unlock()
        if (this.quantity == 0) this.lock()
        else this.unlock()
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
