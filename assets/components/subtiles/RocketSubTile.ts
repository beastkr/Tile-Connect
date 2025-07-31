import { _decorator, Node, Sprite, tween, Vec3 } from 'cc'
import { getScale, Item, TileType, Turn } from '../../type/global'
import { AnimationHandler } from '../animation-handler/AnimationHandler'
import Board from '../board/Board'
import GameManager from '../manager/GameManager'
import Tile from '../tiles/Tile'
import { BaseSubTile } from './BaseSubTile'
const { ccclass, property } = _decorator

@ccclass('RocketSubTile')
export class RocketSubTile extends BaseSubTile {
    @property(Node)
    particle: Node | null = null
    @property(Sprite)
    rocket1: Sprite | null = null
    @property(Sprite)
    rocket2: Sprite | null = null
    public onAttach(tile: Tile): void {
        super.onAttach(tile)
        this.particle!.active = true
        this.tile?.wholeSprite!.addChild(this.particle!)
        tile.setTypeID(TileType.ROCKET)
        console.log(this.tile?.node.position)
    }
    public onDead(board: Board, isMain: boolean, other: RocketSubTile): void {
        this.tile?.node.removeChild(this.particle!)
        this.tile!.node.active = false
        if (!this.tile) return
        if (!isMain) return
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

        console.log('explode random 2 tiles of type:', randomType)
        this.rocket1!.node.active = true
        this.rocket2!.node.active = true
        // Set vị trí ban đầu
        const start1 = this.tile!.node.getPosition()
        const start2 = other.tile!.node.getPosition()
        const pos1 = selected[0].node.getPosition()
        const pos2 = selected[1].node.getPosition()
        this.rocket1?.node.setPosition(start1)
        this.rocket2?.node.setPosition(start2)
        // this.node.parent?.getComponent(GameManager)?.turnOffInput()

        if (selected && selected.length >= 2 && this.rocket1 && this.rocket2) {
            this.node.parent?.getComponent(GameManager)!.itemManager!.lockItem(Item.ROCKET)
            const pos1 = selected[0].node.getPosition()
            const pos2 = selected[1].node.getPosition()

            // Tween rocket1 bay tới selected[0]
            // Tính hướng xoay
            const angle1 = getAngleBetween(start1, pos1)
            const angle2 = getAngleBetween(start2, pos2)
            AnimationHandler.animTile.push(
                new Promise<void>((resolve) => {
                    tween(this.rocket1!.node)
                        .to(
                            0.2,
                            { scale: new Vec3(getScale().x, getScale().y, 1), angle: angle1 },
                            { easing: 'sineOut' }
                        )
                        .to(0.2, { position: pos1 }, { easing: 'sineInOut' }) // thêm angle vào đây
                        .call(() => {
                            this.node.parent
                                ?.getComponent(GameManager)!
                                .itemManager!.unlockItem(Item.ROCKET)
                            selected[0].onDead(board, true, selected[1])
                            selected[0].kill()
                            this.rocket1!.node.active = false
                            this.rocket1!.node.setScale(new Vec3(1, 1, 1))
                            this.rocket1!.node.angle = 0 // reset angle nếu cần
                            this.node.parent?.getComponent(GameManager)?.switchTurn(Turn.MATCH)

                            this.kill()

                            resolve()
                        })
                        .start()
                })
            )
            AnimationHandler.animTile.push(
                new Promise<void>((resolve) => {
                    tween(this.rocket2!.node)
                        .to(
                            0.2,
                            { scale: new Vec3(getScale().x, getScale().y, 1), angle: angle2 },
                            { easing: 'sineOut' }
                        )
                        .to(0.2, { position: pos2 }, { easing: 'sineInOut' }) // thêm angle ở đây
                        .call(() => {
                            selected[1].onDead(board, false, selected[0])
                            selected[1].kill()
                            this.rocket2!.node.active = false
                            this.rocket2!.node.setScale(new Vec3(1, 1, 1))
                            this.rocket2!.node.angle = 0
                            this.node.parent?.getComponent(GameManager)?.switchTurn(Turn.MATCH)
                            other.kill()
                            resolve()
                        })
                        .start()
                })
            )
        }
    }
}
function getAngleBetween(from: Vec3, to: Vec3): number {
    const dx = to.x - from.x
    const dy = to.y - from.y
    const radians = Math.atan2(dy, dx)
    const degrees = (radians * 180) / Math.PI
    return degrees - 90 + 25
}
