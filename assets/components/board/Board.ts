import { _decorator, Component, Size, Vec2 } from 'cc'
import GameConfig from '../../constants/GameConfig'
import { SubType, TileType } from '../../type/global'
import { TileConnect } from '../../type/type'
import { Level } from '../level/Level'
import TilePool from '../pool/TilePool'
import { BaseSubTile } from '../subtiles/BaseSubTile'
import SubTilePool from '../subtiles/SubTilePool'
import Tile from '../tiles/Tile'
const { ccclass, property } = _decorator

@ccclass('Board')
class Board extends Component implements TileConnect.IBoard {
    public board: TileConnect.ITile[][] = []

    public match(tile1: Tile, tile2: Tile): void {
        if (this.canMatch(tile1, tile2)) {
            tile1.onDead(this, true, tile2)
            tile1.onDead(this, false, tile1)
            tile1.kill()
            tile2.kill()
        }
    }

    public canMatch(tile1: Tile, tile2: Tile): boolean {
        if (tile1.getTypeID() !== tile2.getTypeID()) return false
        if (tile1 === tile2) return false

        const { path, turnNum } = this.getPath(tile1, tile2)
        console.log(path)
        return path.length > 0 && turnNum <= 2
    }

    public getPath(tile1: Tile, tile2: Tile): { path: Vec2[]; turnNum: number } {
        const start = tile1.getCoordinate()
        const end = tile2.getCoordinate()

        const height = this.board.length
        const width = this.board[0].length

        const directions = [
            new Vec2(0, 1), // up
            new Vec2(1, 0), // right
            new Vec2(0, -1), // down
            new Vec2(-1, 0), // left
        ]

        type Node = {
            pos: Vec2
            dir: Vec2
            turn: number
            path: Vec2[]
            f: number
        }

        const heuristic = (pos: Vec2): number => {
            return Math.abs(pos.x - end.x) + Math.abs(pos.y - end.y)
        }

        const visited = Array.from({ length: height }, () =>
            Array.from({ length: width }, () => Array(4).fill(Infinity))
        )

        const open: Node[] = []

        for (let d = 0; d < 4; d++) {
            const dir = directions[d]
            const next = start.clone().add(dir)
            if (!this.validate(next, end)) continue

            const h = heuristic(next)
            const node: Node = {
                pos: next,
                dir,
                turn: 0,
                path: [start.clone(), next.clone()],
                f: 0 + h,
            }
            open.push(node)
            visited[next.y][next.x][d] = 0
        }

        while (open.length > 0) {
            // Sort by lowest f-cost
            open.sort((a, b) => a.f - b.f)
            const current = open.shift()!

            const { pos, dir, turn, path } = current

            if (pos.equals(end)) {
                return { path, turnNum: turn }
            }

            for (let d = 0; d < 4; d++) {
                const newDir = directions[d]
                const newTurn = dir.equals(newDir) ? turn : turn + 1
                if (newTurn > 2) continue

                const next = pos.clone().add(newDir)
                if (!this.validate(next, end)) continue
                if (visited[next.y][next.x][d] <= newTurn) continue

                visited[next.y][next.x][d] = newTurn

                const newPath = [...path]
                if (!dir.equals(newDir)) {
                    newPath.push(pos.clone())
                }
                newPath.push(next.clone())

                const h = heuristic(next)
                const g = newTurn
                const f = g + h

                open.push({
                    pos: next,
                    dir: newDir,
                    turn: newTurn,
                    path: newPath,
                    f,
                })
            }
        }

        return { path: [], turnNum: 0 }
    }

    public resetInput() {
        for (const row of this.board) {
            for (const tile of row) {
                tile.clearOnClickCallbacks()
            }
        }
    }

    public getBoardSize() {
        return new Size(
            GameConfig.TileSize * this.board[0].length,
            GameConfig.TileSize * this.board.length
        )
    }

    private validate(pos: Vec2, end: Vec2): boolean {
        const x = pos.x
        const y = pos.y
        if (y < 0 || y >= this.board.length || x < 0 || x >= this.board[0].length) return false

        const tile = this.board[y][x] as Tile

        // Cho đi nếu:
        // - không có tile (null)
        // - hoặc tile không active
        // - hoặc tile chính là tile đích (tile2)
        return (
            tile == null || tile.getTypeID() === TileType.NONE || tile === this.board[end.y][end.x]
        )
    }

    public setUpManager(game: TileConnect.IGameManager): void {
        for (const row of this.board) {
            for (const tile of row)
                tile.addOnClickCallback((tile: TileConnect.ITile) => game.choose(tile))
        }
    }

    public create(pool: TilePool, level: Level): void {
        pool.returnAll()
        const extra = 1
        const height = level.gridHeight + extra * 2
        const width = level.gridWidth + extra * 2

        for (let y = 0; y < height; y++) {
            this.board[y] = []
            for (let x = 0; x < width; x++) {
                const tile = pool.getFirstItem()
                this.board[y].push(tile!)
                tile?.setTheme(level.theme)

                const realX = x - extra
                const realY = y - extra

                if (
                    realX >= 0 &&
                    realX < level.gridWidth &&
                    realY >= 0 &&
                    realY < level.gridHeight
                ) {
                    tile?.setTypeID(level.grid[realY][realX])

                    tile?.reScale(level.scale)
                } else {
                    tile?.hide()
                }

                tile?.setCoordinate(new Vec2(x, y))
                tile?.moveToRealPositionWithPadding(level)
            }
        }
    }
    public addSubTile(pool: SubTilePool, level: Level, key: SubType) {
        const subTileMap = level.layer.get(key)
        if (!subTileMap) return

        const extra = 1
        for (let y = 0; y < level.gridHeight; y++) {
            for (let x = 0; x < level.gridWidth; x++) {
                const value = subTileMap[y]?.[x]

                if (value === 1) {
                    const sub = pool.getFirstItem()
                    const tile = this.board[y + extra][x + extra]
                    tile?.attachSubType(sub as BaseSubTile, key)
                }
            }
        }
    }
}

export default Board
