import {
    _decorator,
    Component,
    director,
    Node,
    ParticleSystem2D,
    resources,
    Sprite,
    SpriteFrame,
} from 'cc'
import GameManager from '../manager/GameManager'
import { getComboCount, SFX } from '../../type/global'
import { SoundManager } from '../manager/SoundManager'
import { TileConnect } from '../../type/type'
const { ccclass, property } = _decorator

@ccclass('Combo')
export class Combo extends Component {
    @property(GameManager)
    private gm: GameManager | null = null
    private timer: number = 5
    private currentTime: number = 0
    private comboCount = 0
    @property(Sprite)
    private fill: Sprite | null = null
    @property(Node)
    private bom: Node | null = null
    @property(Node)
    private firstNode: Node | null = null
    @property(Node)
    private secondNode: Node | null = null
    @property([SpriteFrame])
    private listSprite: SpriteFrame[] = []
    private boundOnMatchPair: (() => void) | null = null

    start() {
        if (this.fill) {
            this.fill.fillRange = 1
        }
        if (this.gm) {
            this.boundOnMatchPair = this.onMatchPair.bind(this)
            this.gm.onMatchPair(this.boundOnMatchPair)
        }
        this.node.active = false
        director.on(TileConnect.GAME_EVENTS.COUNTDOWN_RESET, this.resetCombo, this)
    }

    onDestroy() {
        if (this.gm && this.boundOnMatchPair) {
            this.gm.offMatchPair(this.boundOnMatchPair)
        }
    }

    update(deltaTime: number) {
        this.currentTime += deltaTime
        const progress = Math.min(this.currentTime / this.timer, 1)
        if (this.fill) {
            this.fill.fillRange = 1 - progress
        }
        if (this.currentTime > this.timer) {
            this.node.active = false
            this.comboCount = 0
            this.hideAllComboNumbers()
        }
    }

    private explode() {
        const particle = this.bom ? this.bom.getComponent(ParticleSystem2D) : null
        if (particle) {
            particle.resetSystem()
        }
    }

    private onMatchPair() {
        this.comboCount++
        if (this.comboCount < 2) {
            return
        }

        const c = 'combo_' + String(this.comboCount > 5 ? 5 : this.comboCount)
        SoundManager.instance.playSFX(c)

        this.hideAllComboNumbers()
        this.explode()
        console.log(this.comboCount)

        if (this.comboCount < 10) {
            const digit = this.comboCount
            this.firstNode!.getComponent(Sprite)!.spriteFrame = this.listSprite[digit]
            this.firstNode!.active = true
        } else {
            const firstNum = Math.floor(this.comboCount / 10)
            const secondNum = this.comboCount % 10
            this.firstNode!.getComponent(Sprite)!.spriteFrame = this.listSprite[firstNum]
            this.firstNode!.active = true
            this.secondNode!.getComponent(Sprite)!.spriteFrame = this.listSprite[secondNum]
            this.secondNode!.active = true
        }
        this.node.active = true
        this.currentTime = 0
        if (this.fill) {
            this.fill.fillRange = 1
        }
    }

    private hideAllComboNumbers() {
        if (this.firstNode) this.firstNode.active = false
        if (this.secondNode) this.secondNode.active = false
    }

    resetCombo() {
        this.comboCount = 0
        this.node.active = false
        this.currentTime = 0
        if (this.fill) {
            this.fill.fillRange = 1
        }
    }
}
