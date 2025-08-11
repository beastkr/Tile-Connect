import { _decorator, Component, Label, Node, setDefaultLogTimes, Sprite, Tween, tween, UITransform, Vec3 } from 'cc'
import { AnimationHandler } from '../animation-handler/AnimationHandler'
import GameManager from '../manager/GameManager'
import { SoundManager } from '../manager/SoundManager'
import { SFX } from '../../type/global'
const { ccclass, property } = _decorator

@ccclass('FillProgressBar')
export class FillProgressBar extends Component {
    @property(GameManager)
    private gm: GameManager | null = null
    @property(Sprite)
    private left: Sprite | null = null
    @property(Sprite)
    private right: Sprite | null = null
    @property(Sprite)
    private mid: Sprite | null = null
    @property(Sprite)
    private star: Sprite | null = null
    @property(Sprite)
    private star1: Sprite | null = null
    @property(Sprite)
    private star9: Sprite | null = null
    public currentStar: Node | null = null
    private total: number = 0
    private currentTile: number = 0
    private size: number = 0
    private isFirstFill: boolean = true
    private tailNode: Node | null = null
    private currentActive: number = 0
    private score: number = 0
    @property(Label)
    public level!: Label

    start() {
        this.left!.node.setScale(0, this.left!.node.scale.y, this.left!.node.z)
        this.right!.node.setScale(0, this.right!.node.scale.y, this.right!.node.z)
        this.mid!.node.setScale(0, this.mid!.node.scale.y, this.mid!.node.z)
        this.tailNode = this.mid!.node.getChildByName('taile')
        this.size = this.node.getChildByName('bar')?.getComponent(UITransform)?.contentSize.x ?? 0
        AnimationHandler.setFillProgressBar(this)
        this.currentStar = this.star?.node ?? null
        if (this.gm) {
            this.total = this.gm?.currentLevel?.getTileNum() ?? 0
            console.log(this.total)
            this.level!.string = `Lvl ${this.gm.currentNumber()}`
        }
    }

    private onTilesMatched(event: any) {
        console.log('Tiles matched!')
        this.updateProgressBar()
    }

    public updateProgressBar() {
        if (this.mid!.node.scale.x > 9) {
            return
        }
        if (this.total <= 0 || this.size <= 0) return
        const progress = (2 * 9) / this.total
        if (this.isFirstFill && progress > 0) {
            this.showLeft()
            this.showRight()
            this.isFirstFill = false
        }

        this.updateMidWidth(progress)
        this.checkActive()
    }
    public isLastStar(): boolean {
        if (this.currentStar == this.star1?.node) {
            return true
        }

        return false
    }
    public updateTillWin() {
        this.updateMidWidth(9 - this.mid!.node.scale.x)
        this.star!.node.active = true
        this.star9!.node.active = true
        this.star1!.node.active = true
        this.currentStar = this.star1?.node ?? null
    }
    public checkActive() {
        if (this.mid!.node.scale.x >= 4.5) {
            this.star!.node.active = true
            this.currentStar = this.star9?.node ?? null
        }
        if (this.mid!.node.scale.x >= 6) {
            this.star9!.node.active = true
            this.currentStar = this.star1?.node ?? null
        }
        if (this.mid!.node.scale.x >= 7.4) {
            this.star1!.node.active = true
        }
    }
    private showLeft() {
        this.left!.node.setScale(1, this.left!.node.scale.y, this.left!.node.scale.z)
    }

    private updateMidWidth(progress: number) {
        SoundManager.instance.playSFX(SFX.PROGRESS)
        tween(this.mid!.node)
            .to(
                0.3,
                {
                    scale: new Vec3(
                        progress + this.mid!.node.scale.x,
                        this.mid!.node.scale.y,
                        this.mid!.node.scale.z
                    ),
                },
                {
                    onUpdate: () => {
                        this.updateRightPosition()
                    },
                }
            )
            .start()
    }

    private updateRightPosition() {
        if (this.right && this.mid) {
            const midTransform = this.mid.node.getComponent(UITransform)
            if (midTransform) {
                const originalWidth = midTransform.contentSize.x
                const currentWidth = originalWidth * this.mid.node.scale.x
                const anchorX = midTransform.anchorX
                const midPos = this.mid.node.position
                const rightEdgeX = midPos.x + currentWidth * (1 - anchorX)

                this.right.node.setPosition(
                    rightEdgeX,
                    this.right.node.position.y,
                    this.right.node.position.z
                )
            }
        }
    }

    private showRight() {
        this.updateRightPosition()
        this.right!.node.setScale(1, this.right!.node.scale.y, this.right!.node.scale.z)
    }

    public resetProgressBar() {
        Tween.stopAllByTarget(this.mid?.node)
        this.score = 0
        this.currentTile = 0
        this.isFirstFill = true
        this.left!.node.setScale(0, this.left!.node.scale.y, this.left!.node.z)
        this.right!.node.setScale(0, this.right!.node.scale.y, this.right!.node.z)
        this.mid!.node.setScale(0, this.mid!.node.scale.y, this.mid!.node.z)
        this.star!.node.active = false
        this.star1!.node.active = false
        this.star9!.node.active = false
        this.currentStar = this.star?.node ?? null
    }
    public setTotal(hi: number) {
        this.total = hi
    }
    public setLv(hi: number) {
        this.level!.string = `Lvl ${hi}`
    }
}
