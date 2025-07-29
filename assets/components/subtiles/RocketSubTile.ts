import { _decorator, Sprite, tween, Vec3 } from 'cc'
import { TileType } from '../../type/global'
import { AnimationHandler } from '../animation-handler/AnimationHandler'
import Board from '../board/Board'
import Tile from '../tiles/Tile'
import { BaseSubTile } from './BaseSubTile'
const { ccclass, property } = _decorator

@ccclass('RocketSubTile')
export class RocketSubTile extends BaseSubTile {
    @property(Sprite)
    rocket1: Sprite | null = null
    @property(Sprite)
    rocket2: Sprite | null = null
    public onAttach(tile: Tile): void {
        super.onAttach(tile)
        tile.setTypeID(TileType.ROCKET)
        console.log(this.tile?.node.position)
    }
    public onDead(board: Board, isMain: boolean, other: RocketSubTile): void {
        if (!isMain) return
        const tileMap = new Map<TileType, Tile[]>()

        // Gom tất cả tile có type hợp lệ
        for (const row of board.board) {
            for (const tile of row) {
                const type = tile.getTypeID()
                if (type === TileType.NONE || tile === this.tile || tile === other.tile) continue

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
            const pos1 = selected[0].node.getPosition()
            const pos2 = selected[1].node.getPosition()

            // Tween rocket1 bay tới selected[0]
            // Tính hướng xoay
            const angle1 = getAngleBetween(start1, pos1)
            const angle2 = getAngleBetween(start2, pos2)
            AnimationHandler.animTile.push(
                new Promise<void>((resolve) => {
                    tween(this.rocket1!.node)
                        .to(0.3, { scale: new Vec3(2, 2, 1), angle: angle1 }, { easing: 'backOut' })
                        .to(0.5, { position: pos1 }, { easing: 'quadOut' }) // thêm angle vào đây
                        .call(() => {
                            selected[0].onDead(board, isMain, selected[1])
                            selected[0].kill()
                            this.rocket1!.node.active = false
                            this.rocket1!.node.setScale(new Vec3(1, 1, 1))
                            this.rocket1!.node.angle = 0 // reset angle nếu cần
                            // this.node.parent?.getComponent(GameManager)?.turnOnInput()
                            resolve()
                        })
                        .start()
                })
            )
            AnimationHandler.animTile.push(
                new Promise<void>((resolve) => {
                    tween(this.rocket2!.node)
                        .to(0.3, { scale: new Vec3(2, 2, 1), angle: angle2 }, { easing: 'backOut' })
                        .to(0.5, { position: pos2 }, { easing: 'quadOut' }) // thêm angle ở đây
                        .call(() => {
                            selected[1].onDead(board, isMain, selected[0])
                            selected[1].kill()
                            this.rocket2!.node.active = false
                            this.rocket2!.node.setScale(new Vec3(1, 1, 1))
                            this.rocket2!.node.angle = 0
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
