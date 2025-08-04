import { _decorator, Component, Node, ParticleSystem2D, Sprite, SpriteFrame } from 'cc'
import GameManager from '../manager/GameManager'
import { getComboCount } from '../../type/global'
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
    private listSprite: { [key: number]: Node } = {}
    @property(Node)
    private bom: Node | null = null
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

        for (let i = 2; i < 10; i++) {
            const child = this.node.getChildByName(`${i}`)
            if (child) {
                this.listSprite[i] = child
                child.active = false
            }
        }
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
        if (this.comboCount < 2) return
        if (this.comboCount > 9) this.comboCount--
        this.hideAllComboNumbers()
        this.explode()
        if (this.listSprite[this.comboCount]) {
            this.listSprite[this.comboCount].active = true
        }

        this.node.active = true
        console.log('Match pair detected! Combo count:', this.comboCount)
        this.resetCombo()
    }

    private hideAllComboNumbers() {
        for (let i = 2; i < 10; i++) {
            if (this.listSprite[i]) {
                this.listSprite[i].active = false
            }
        }
    }

    resetCombo() {
        this.currentTime = 0
        if (this.fill) {
            this.fill.fillRange = 1
        }
    }
}
