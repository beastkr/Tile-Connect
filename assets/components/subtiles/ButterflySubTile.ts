import { _decorator, Node, resources, SceneAsset, Sprite, SpriteFrame, Tween, tween, Vec3, view } from 'cc'
import Board from '../board/Board'
import Tile from '../tiles/Tile'
import { BaseSubTile } from './BaseSubTile'
import { getAllDescendants, getTilePath, SubType, Theme, TileType } from '../../type/global'
import { FillProgressBar } from '../animation-handler/FillProgressBar'
const { ccclass, property } = _decorator

@ccclass('ButterflySubtile')
export class ButterflySubtile extends BaseSubTile {
    @property(Node)
    wing1: Node | null = null
    @property(Node)
    wing2: Node | null = null
    @property(Node)
    body: Node | null = null

    @property(Node)
    shadow: Node | null = null
    @property(Node)
    wingShadow: Node[] = []


    private wingType: SpriteFrame | null = null

    public onAttach(tile: Tile): void {
        if (tile.getTypeID() == TileType.ROCKET) {
            tile.detachSubType(SubType.BUTTERFLY)
            this.kill()
            return
        }
        super.onAttach(tile)
        const PATH = getTilePath(this.tile!.getTypeID(), Theme.BUTTERFLY)
        this.wingType = resources.get(PATH, SpriteFrame)
        this.shadow?.setScale(tile.originScale * 0.6, tile.originScale * 0.6)
    }
    public onDead(board: Board, isMain: boolean, other: BaseSubTile, killByRocket: boolean): void {

        if (!isMain || killByRocket || this.tile!.getTypeID() == TileType.ROCKET) return
        console.log('butter is flying')
        this.setupWing()
        this.wing1?.setPosition(this.tile!.node.position)
        this.wing2?.setPosition(other.tile!.node.position)
        this.moveWingToWing()

    }
    public kill() {
        super.kill()
        this.stopTween()
        this.node.setPosition(0, 0)
        this.body!.active = false
        this.node.angle = 0
        this.wing1!.active = false
        this.wing2!.active = false
        this.shadow!.active = false
    }

    stopTween() {
        const child = getAllDescendants(this.node)
        Tween.stopAllByTarget(this)
        child.forEach(node => {
            Tween.stopAllByTarget(node)
        });
    }

    showShadow() {
        this.shadow!.active = true
    }

    private setupWing() {
        const wing1Sprite = this.wing1?.getComponent(Sprite)
        const wing2Sprite = this.wing2?.getComponent(Sprite)
        this.wingShadow.forEach(element => {
            element.getComponent(Sprite)!.spriteFrame = this.wingType
        });

        wing1Sprite!.spriteFrame = this.wingType
        wing2Sprite!.spriteFrame = this.wingType
        this.wing1?.setScale(new Vec3(this.tile!.originScale * 0.7, this.tile!.originScale * 0.7))
        this.wing2?.setScale(new Vec3(this.tile!.originScale * 0.7, this.tile!.originScale * 0.7))
    }

    flap() {
        const wing1Scale = this.wing1!.scale.clone()
        const wing2Scale = this.wing2!.scale.clone()

        this.wingShadow.forEach(element => {
            const wingScale = element.scale.clone()
            tween(element!)
                .repeatForever(
                    tween()
                        .to(0.2, { scale: new Vec3(wingScale.x * 0.5, wingScale.y, wingScale.z) })
                        .to(0.2, { scale: wingScale })
                )
                .start()

        });

        tween(this.wing1!)
            .repeatForever(
                tween()
                    .to(0.2, { scale: new Vec3(wing1Scale.x * 0.5, wing1Scale.y, wing1Scale.z) })
                    .to(0.2, { scale: wing1Scale })
            )
            .start()

        tween(this.wing2!)
            .repeatForever(
                tween()
                    .to(0.2, { scale: new Vec3(wing2Scale.x * 0.5, wing2Scale.y, wing2Scale.z) })
                    .to(0.2, { scale: wing2Scale })
            )
            .start()
    }

    resetPos() {
        this.node.setPosition(this.wing2!.position)
        this.wing1?.setPosition(0, 0)
        this.wing2?.setPosition(0, 0)
    }

    flyUp() {
        tween(this.node).to(0.2, { scale: new Vec3(1.2, 1.2) }).start()
    }

    moveWingToWing() {
        this.wing1!.active = true
        this.wing2!.active = true
        tween(this.wing1!).to(0.36, { position: this.wing2?.position }).call(() => {
            this.body!.active = true
            this.flipWing(this.wing1!)
            this.resetPos()
            this.flyUp()

        }).start()
    }

    flipWing(wing: Node) {
        const scale = wing.scale.clone()
        this.wing1?.setScale(new Vec3(-scale!.x, scale!.y))
        tween(wing).to(0.1, {
            scale: new Vec3(-scale!.x, scale!.y)
        }).call(() => {
            this.move()
            this.flap()
        }).start()
    }

    move() {
        this.shadow!.active = true

        // Vị trí shadow ngẫu nhiên (±40 theo x, 40–100 theo y)
        const randomOffsetX = (Math.random() * 80) - 40     // [-40, 40]
        const randomOffsetY = 40 + Math.random() * 60       // [40, 100]
        const shadowPos = new Vec3(0, randomOffsetY, 0)
        this.shadow!.setPosition(shadowPos)

        // Random bên trái (-x) hoặc phải (+x)
        const isLeft = Math.random() < 0.5
        const targetX = isLeft ? -500 : view.getVisibleSize().width + 500
        const target = new Vec3(targetX, 900)

        // Tính góc xoay để hướng về target
        const angle = getAngleBetween(this.node.worldPosition, target)

        tween(this.node)
            .to(0.7, { eulerAngles: new Vec3(0, 0, angle) }, { easing: 'sineInOut' })
            .to(3, { worldPosition: target })
            .call(() => this.kill())
            .start()
    }


    public onDetach(): void {
        super.onDetach()
    }

}
function getAngleBetween(from: Vec3, to: Vec3): number {
    const dx = to.x - from.x
    const dy = to.y - from.y
    const radians = Math.atan2(dy, dx)
    const degrees = (radians * 180) / Math.PI
    return degrees - 90
}
