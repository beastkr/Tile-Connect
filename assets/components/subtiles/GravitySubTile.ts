import { _decorator, Vec2 } from 'cc'
import { TileType } from '../../type/global'
import Board from '../board/Board'
import GameManager from '../manager/GameManager'
import Tile from '../tiles/Tile'
import { BaseSubTile } from './BaseSubTile'

const { ccclass, property } = _decorator

@ccclass('GravitySubtile')
export class GravitySubTile extends BaseSubTile {
    direction: { x: number; y: number } = { x: 0, y: -1 }
    changeAfterMove: boolean = false

    public onAttach(tile: Tile): void {
        super.onAttach(tile)
    }

    public onDead(board: Board, isMain: boolean, other: GravitySubTile): void {
        if (!this.tile || !other.tile) return

        const thisCoord = this.tile.getCoordinate()
        const otherCoord = other.tile.getCoordinate()

        if (isMain) {
            // Tính dot product với hướng để xác định ai đi trước
            const thisDot = thisCoord.x * this.direction.x + thisCoord.y * this.direction.y
            const otherDot = otherCoord.x * this.direction.x + otherCoord.y * this.direction.y

            const [first, second] = otherDot > thisDot ? [other, this] : [this, other]

            first.tile!.kill()
            second.tile!.kill()

            first.resolveGravity(board)
            second.resolveGravity(board)
        }
    }
    private resolveGravity(board: Board) {
        console.log('gravity match')

        const origin = this.tile?.getCoordinate()
        if (!origin) return

        const dx = this.direction.x
        const dy = this.direction.y

        const height = board.board.length
        const width = board.board[0].length

        let x = origin.x
        let y = origin.y

        const level = this.node.parent?.getComponent(GameManager)?.currentLevel
        if (!level) return

        while (true) {
            const nextX = x + dx
            const nextY = y + dy

            if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) break

            const currentTile = board.board[y][x] as Tile
            const nextTile = board.board[nextY][nextX] as Tile

            if (
                currentTile.getTypeID() === TileType.NONE &&
                nextTile.getTypeID() !== TileType.NONE
            ) {
                board.board[y][x] = nextTile
                board.board[nextY][nextX] = currentTile

                nextTile.setCoordinate(new Vec2(x, y))
                nextTile.moveToRealPositionWithPadding(level)

                currentTile.setCoordinate(new Vec2(nextX, nextY))
                currentTile.moveToRealPositionWithPadding(level)
            }

            x = nextX
            y = nextY
        }
    }
}
