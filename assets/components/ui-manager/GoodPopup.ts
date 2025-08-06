import { _decorator, Component, Node, Sprite, SpriteFrame, tween, Vec3 } from 'cc'
import GameManager from '../manager/GameManager'
const { ccclass, property } = _decorator

@ccclass('Good')
export class Good extends Component {
    @property(GameManager)
    private gm: GameManager | null = null
    private timer: number = 5
    private currentTime: number = 0
    private comboCount = 0
    @property([SpriteFrame])
    private listSprite: SpriteFrame[] = []
    @property([SpriteFrame])
    private listLight: SpriteFrame[] = []
    private boundOnMatchPair: (() => void) | null = null
    @property(Node)
    private light: Node | null = null
    @property(Node)
    private gud: Node | null = null
    private origin: Vec3 = new Vec3()

    start() {
        if (this.gm) {
            this.boundOnMatchPair = this.onMatchPair.bind(this)
            this.gm.onMatchPair(this.boundOnMatchPair)
        }
        this.node.active = false
        this.origin = this.node.position.clone()
    }

    onDestroy() {
        if (this.gm && this.boundOnMatchPair) {
            this.gm.offMatchPair(this.boundOnMatchPair)
        }
    }

    update(deltaTime: number) {
        this.currentTime += deltaTime
        // console.log(this.currentTime)

        if (this.currentTime > this.timer) {
            this.node.active = false
            this.comboCount = 0
        }
    }

    private onMatchPair() {
        this.comboCount++

        if (this.comboCount < 2) return
        const spriteIndex = this.comboCount - 2
        const maxIndex = Math.min(spriteIndex, this.listSprite.length - 1)

        const sprite = this.gud?.getComponent(Sprite)
        if (sprite && maxIndex >= 0 && maxIndex < this.listSprite.length) {
            sprite.spriteFrame = this.listSprite[maxIndex]
        }

        const lightSprite = this.light?.getComponent(Sprite)
        if (lightSprite && maxIndex >= 0 && maxIndex < this.listLight.length) {
            lightSprite.spriteFrame = this.listLight[maxIndex]
        }

        this.gud!.active = false
        this.light!.active = false
        this.node.active = true

        this.playSequentialAnimation()
        this.resetCombo()
    }

    private playSequentialAnimation() {
        this.showLight(() => {
            this.showPic(() => {
                this.moveNodeUp()
            })
        })
    }

    private showLight(callback?: () => void) {
        this.light!.active = true
        this.light!.scale = new Vec3(0, 0, 1)
        tween(this.light!)
            .to(0.1, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .call(() => {
                if (callback) callback()
            })
            .start()
    }

    private showPic(callback?: () => void) {
        this.gud!.active = true
        this.gud!.scale = new Vec3(0, 0, 1)
        tween(this.gud!)
            .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .call(() => {
                if (callback) callback()
            })
            .start()
    }
    private moveNodeUp() {
        this.node.setPosition(this.origin.clone())
        const currentPosition = this.node.position.clone()
        const targetPosition = new Vec3(
            currentPosition.x,
            currentPosition.y + 30,
            currentPosition.z
        )

        tween(this.node)
            .to(0.3, { position: targetPosition }, { easing: 'quadOut' })
            .delay(0.2)
            .call(() => {
                this.gud!.active = false
                this.light!.active = false
                this.node.position = currentPosition
            })
            .start()
    }

    private resetCombo() {
        this.currentTime = 0
    }
}
