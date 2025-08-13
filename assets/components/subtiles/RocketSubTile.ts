import { _decorator, Animation, Node, ParticleSystem2D, Sprite, tween, Vec3 } from 'cc'
import { backInSlowEnd, getTilePositionByLevel, Item, SFX, TileType, Turn } from '../../type/global'
import { AnimationHandler } from '../animation-handler/AnimationHandler'
import Board from '../board/Board'
import GameManager from '../manager/GameManager'
import Tile from '../tiles/Tile'
import { BaseSubTile } from './BaseSubTile'
import { SoundManager } from '../manager/SoundManager'
const { ccclass, property } = _decorator

@ccclass('RocketSubTile')
export class RocketSubTile extends BaseSubTile {
    @property(Node)
    particle: Node | null = null
    @property(Sprite)
    rocket1: Sprite | null = null
    @property(Sprite)
    rocket2: Sprite | null = null
    @property(Animation)
    exploAnim: Animation | null = null
    @property(Animation)
    exploAnim2: Animation | null = null
    @property(Animation)
    tileBreak: Animation | null = null
    @property(Animation)
    tileBreak1: Animation | null = null
    public onAttach(tile: Tile): void {
        super.onAttach(tile)
        this.particle!.active = true
        this.tile?.wholeSprite!.addChild(this.particle!)
        this.particle?.getComponent(ParticleSystem2D)?.resetSystem()
        // tile.setTypeID(TileType.ROCKET)
        console.log(this.tile?.node.position)
    }
    public kill() {
        this.rocket1!.node.active = false
        this.rocket1!.node.active = false
        this.particle!.active = false
        this.rocket2!.node.active = false
        super.kill()
    }

    public onDead(board: Board, isMain: boolean, other: RocketSubTile): void {
        this.kill()
        this.tile?.node.removeChild(this.particle!)

        this.particle!.active = false

        // this.tile!.node.active = false
        if (!this.tile) return
        if (!isMain) return
        if (!other || !other.tile) return
        const tileMap = new Map<TileType, Tile[]>()

        // Gom tất cả tile có type hợp lệ
        for (const row of board.board) {
            for (const tile of row) {
                const type = tile.getTypeID()
                if (
                    type === TileType.NONE ||
                    (tile as Tile).underKill ||
                    tile === this.tile ||
                    tile === other.tile
                )
                    continue

                if (!tileMap.has(type)) {
                    tileMap.set(type, [])
                }
                tileMap.get(type)!.push(tile as Tile)
            }
        }

        // Lọc ra những type có ít nhất 2 tile
        const validTypes = Array.from(tileMap.entries()).filter(([_, tiles]) => tiles.length >= 2)

        if (validTypes.length === 0) return

        // Chọn ngẫu nhiên một loại
        const [randomType, tiles] = validTypes[Math.floor(Math.random() * validTypes.length)]

        // Chọn ngẫu nhiên 2 tile trong số đó
        const shuffled = tiles.sort(() => Math.random() - 0.5)
        const selected = shuffled.slice(0, 2)
        selected[0].underKill = true
        selected[1].underKill = true
        const gameM = this.node.parent?.getComponent(GameManager)
        console.log('explode random 2 tiles of type:', randomType)
        this.rocket1!.node.active = true
        this.rocket2!.node.active = true
        // Set vị trí ban đầu
        const start1 = this.tile.node.position
        const start2 = other.tile!.node.position
        const pos1 = getTilePositionByLevel(
            selected[0].getCoordinate().x,
            selected[0].getCoordinate().y,
            gameM!.currentLevel,
            1
        ).toVec3()
        const pos2 = getTilePositionByLevel(
            selected[1].getCoordinate().x,
            selected[1].getCoordinate().y,
            gameM!.currentLevel,
            1
        ).toVec3()
        this.rocket1?.node.setPosition(start1)
        this.rocket2?.node.setPosition(start2)
        // this.rocket1?.node.setScale(new Vec3(this.tile.originScale, this.tile.originScale))
        // this.rocket2?.node.setScale(new Vec3(this.tile.originScale, this.tile.originScale))
        // this.node.parent?.getComponent(GameManager)?.turnOffInput()

        if (selected && selected.length >= 2 && this.rocket1 && this.rocket2) {
            this.node.parent?.getComponent(GameManager)!.itemManager!.lockItem(Item.ROCKET)
            this.node.parent?.getComponent(GameManager)!.itemManager!.lockItem(Item.SUPERROCKET)
            // const pos1 = selected[0].node.getPosition()
            // const pos2 = selected[1].node.getPosition()

            // Tween rocket1 bay tới selected[0]
            // Tính hướng xoay
            const angle1 = getAngleBetween(start1, pos1)
            const angle2 = getAngleBetween(start2, pos2)
            SoundManager.instance.playSFX(SFX.ROCKET_FLY)
            AnimationHandler.animTile.push(
                new Promise<void>((resolve) => {
                    tween(this.rocket1!.node)
                        .to(
                            0.2,
                            {
                                scale: new Vec3(this.tile?.originScale, this.tile?.originScale),
                                angle: angle1,
                            },
                            { easing: 'sineOut' }
                        )
                        .to(0.6, { position: pos1 }, { easing: backInSlowEnd }) // thêm angle vào đây
                        .call(() => {
                            SoundManager.instance.playSFX(SFX.EXPLODE)
                            selected[0].wholeSprite!.active = false

                            this.tileBreak!.node.setScale(
                                new Vec3(selected[0].originScale, selected[0].originScale)
                            )
                            this.exploAnim!.node.setScale(
                                new Vec3(selected[0].originScale, selected[0].originScale)
                            )

                            this.rocket1!.node.active = false
                            this.rocket1!.node.setScale(new Vec3(1, 1, 1))
                            this.rocket1!.node.angle = 0 // reset angle nếu cần
                            this.exploAnim!.node.setPosition(this.rocket1?.node.position!)
                            this.exploAnim!.node.active = true

                            this.exploAnim?.play()
                            this.tileBreak!.node.setPosition(this.rocket1?.node.position!)
                            this.tileBreak!.node.active = true

                            this.tileBreak?.play()
                            this.tileBreak?.once(Animation.EventType.FINISHED, () => {
                                this.tileBreak!.node.active = false
                                selected[0].onDead(board, true, selected[1], true)
                                selected[0].kill()

                            })
                            this.exploAnim?.once(Animation.EventType.FINISHED, () => {
                                this.exploAnim!.node.active = false
                                this.node.parent?.getComponent(GameManager)?.switchTurn(Turn.MATCH)
                                resolve()

                            })


                        })
                        .start()
                })
            )
            AnimationHandler.animTile.push(
                new Promise<void>((resolve) => {
                    tween(this.rocket2!.node)
                        .to(
                            0.2,
                            {
                                scale: new Vec3(this.tile?.originScale, this.tile?.originScale),
                                angle: angle2,
                            },
                            { easing: 'sineOut' }
                        )
                        .to(0.6, { position: pos2 }, { easing: backInSlowEnd }) // thêm angle ở đây
                        .call(() => {
                            selected[1].wholeSprite!.active = false
                            this.exploAnim2!.node.setScale(
                                new Vec3(selected[1].originScale, selected[1].originScale)
                            )
                            this.tileBreak1!.node.setScale(
                                new Vec3(selected[1].originScale, selected[1].originScale)
                            )

                            this.rocket2!.node.active = false
                            this.rocket2!.node.setScale(new Vec3(1, 1, 1))
                            this.rocket2!.node.angle = 0
                            this.exploAnim2!.node.setPosition(this.rocket2?.node.position!)
                            this.exploAnim2!.node.active = true

                            this.exploAnim2?.play()
                            this.tileBreak1!.node.setPosition(this.rocket2?.node.position!)
                            this.tileBreak1!.node.active = true

                            this.tileBreak1?.play()
                            this.tileBreak1?.once(Animation.EventType.FINISHED, () => {
                                this.tileBreak1!.node.active = false
                                selected[1].onDead(board, false, selected[0], true)
                                selected[1].kill()
                                this.node.parent?.getComponent(GameManager)?.switchTurn(Turn.MATCH)
                            })
                            this.exploAnim2?.once(Animation.EventType.FINISHED, () => {
                                console.log('2')
                                this.exploAnim2!.node.active = false
                                // this.node.parent
                                //     ?.getComponent(GameManager)!
                                //     .itemManager!.unlockItem(Item.ROCKET)
                                // this.node.parent
                                //     ?.getComponent(GameManager)!
                                //     .itemManager!.unlockItem(Item.SUPERROCKET)
                                resolve()

                            })


                        })
                        .start()
                })
            )
        }
        Promise.all(AnimationHandler.animTile).then(() => {
            this.node.parent
                ?.getComponent(GameManager)!
                .itemManager!.unlockItem(Item.ROCKET)
            this.node.parent
                ?.getComponent(GameManager)!
                .itemManager!.unlockItem(Item.SUPERROCKET)
        })
    }

}
function getAngleBetween(from: Vec3, to: Vec3): number {
    const dx = to.x - from.x
    const dy = to.y - from.y
    const radians = Math.atan2(dy, dx)
    const degrees = (radians * 180) / Math.PI
    return degrees - 90
}
