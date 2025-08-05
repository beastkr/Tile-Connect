import { _decorator, Vec2 } from 'cc'
import { Direction, TileType } from '../../type/global'
import Board from '../board/Board'
import GameManager from '../manager/GameManager'
import { GravityManager } from '../manager/GravityManager'
import Tile from '../tiles/Tile'
import { BaseSubTile } from './BaseSubTile'

const { ccclass, property } = _decorator

@ccclass('GravitySubtile')
export class GravitySubTile extends BaseSubTile {
    changeAfterMove: boolean = false

    public onAttach(tile: Tile): void {
        super.onAttach(tile)
    }

    public onDead(board: Board, isMain: boolean, other: GravitySubTile): void {
        if (!this.tile || !other || !other.tile) return

        const thisCoord = this.tile.getCoordinate()
        const otherCoord = other.tile.getCoordinate()

        if (isMain) {
            const thisDot =
                thisCoord.x * GravityManager.direction.x + thisCoord.y * GravityManager.direction.y
            const otherDot =
                otherCoord.x * GravityManager.direction.x +
                otherCoord.y * GravityManager.direction.y

            const [first, second] = otherDot > thisDot ? [other, this] : [this, other]

            first.tile!.kill()
            second.tile!.kill()

            const moved = first.resolveGravity(board)
            // second.resolveGravity(board) // vẫn không cần

            if (moved) {
                GravityManager.cycleGravity()
            }
        }
    }

    public resolveGravity(board: Board): boolean {
        const direction = GravityManager.getCurrentDirection()
        if (direction === Direction.NONE) return false
        console.log(direction)

        const level = this.node.parent?.getComponent(GameManager)?.currentLevel
        if (!level) return false

        const height = board.board.length
        const width = board.board[0].length

        const dx = GravityManager.direction.x
        const dy = GravityManager.direction.y

        const isVertical = dy !== 0
        const isForward = dx + dy > 0

        const range = (length: number) => Array.from({ length }, (_, i) => i).slice(1, length - 1)

        let moved = false // 🔑 flag để kiểm tra tile có đổi vị trí không

        if (isVertical) {
            for (let col = 0; col < width; col++) {
                const tiles: Tile[] = range(height).map((row) => board.board[row][col] as Tile)

                const noneTiles = tiles.filter((tile) => tile.getTypeID() === TileType.NONE)
                const otherTiles = tiles.filter((tile) => tile.getTypeID() !== TileType.NONE)

                const newColumn = isForward
                    ? [...noneTiles, ...otherTiles]
                    : [...otherTiles, ...noneTiles]

                for (let i = 0; i < newColumn.length; i++) {
                    const y = i + 1
                    const tile = newColumn[i]
                    if (board.board[y][col] !== tile) moved = true

                    board.board[y][col] = tile
                    tile.setCoordinate(new Vec2(col, y))
                    tile.moveToRealPositionWithPadding(level)
                }
            }
        } else {
            for (let row = 0; row < height; row++) {
                const tiles: Tile[] = range(width).map((col) => board.board[row][col] as Tile)

                const noneTiles = tiles.filter((tile) => tile.getTypeID() === TileType.NONE)
                const otherTiles = tiles.filter((tile) => tile.getTypeID() !== TileType.NONE)

                const newRow = isForward
                    ? [...noneTiles, ...otherTiles]
                    : [...otherTiles, ...noneTiles]

                for (let i = 0; i < newRow.length; i++) {
                    const x = i + 1
                    const tile = newRow[i]
                    if (board.board[row][x] !== tile) moved = true

                    board.board[row][x] = tile
                    tile.setCoordinate(new Vec2(x, row))
                    tile.moveToRealPositionWithPadding(level)
                }
            }
        }

        return moved
    }
}
