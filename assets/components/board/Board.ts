import { _decorator, Component, Size, Tween, tween, Vec2 } from 'cc'
import { Theme } from './../../type/global'

import GameConfig from '../../constants/GameConfig'
import { SubType, TileType } from '../../type/global'
import { TileConnect } from '../../type/type'
import { AnimationHandler } from '../animation-handler/AnimationHandler'
import { Level } from '../level/Level'
import { LevelLoader } from '../level/LevelLoader'
import GameManager from '../manager/GameManager'
import PathPool from '../pool/PathPool'
import StarPool from '../pool/StarPool'
import TilePool from '../pool/TilePool'
import { BaseSubTile } from '../subtiles/BaseSubTile'
import SubTilePool from '../subtiles/SubTilePool'
import Tile from '../tiles/Tile'
const { ccclass, property } = _decorator

export interface TilePair {
    tile: Tile
    position: Vec2
    type: TileType
    theme: Theme
}

@ccclass('Board')
class Board extends Component implements TileConnect.IBoard {
    public board: TileConnect.ITile[][] = []
    shuffling: boolean = false
    listPair: TilePair[] = []
    game: GameManager | null = null

    private matchedPairsCount: number = 0
    private respawnCount: number = 0
    private readonly MAX_RESPAWNS_PER_LEVEL: number = 3
    private readonly FIRST_RESPAWN_THRESHOLD: number = 5
    private readonly SUBSEQUENT_RESPAWN_INTERVAL: number = 3

    public match(tile1: Tile, tile2: Tile): void {
        if (tile1.underKill || tile2.underKill) return
        if (this.canMatch(tile1, tile2)) {
            const path = this.getPath(tile1, tile2)
            this.drawPath(path.path, this.game?.pathPool!)
            this.putStar(path.path, this.game?.starPool!)

            this.listPair.push({
                tile: tile1,
                position: tile1.getCoordinate(),
                type: tile1.getTypeID(),
                theme: tile1.getTheme(),
            })
            this.listPair.push({
                tile: tile2,
                position: tile2.getCoordinate(),
                type: tile2.getTypeID(),
                theme: tile2.getTheme(),
            })

            tile1.onDead(this, true, tile2)
            tile2.onDead(this, false, tile1)
            tile1.kill()
            tile2.kill()

            this.matchedPairsCount++

            this.checkAndRespawnTiles()
        } else {
            ;(this.game?.tilePool as TilePool).shake(10, this.game!.currentLevel)
            this.game?.unChoose()
        }
    }

    private checkAndRespawnTiles(): void {
        const levelData = LevelLoader.getInstance().getLevelData()
        if (!levelData || levelData.Difficulty < 3) {
            return
        }
        const shouldRespawn = this.shouldRespawnTiles()

        if (shouldRespawn && this.listPair.length >= 2) {
            Promise.all(AnimationHandler.animList).then(() => {
                this.respawnRandomTilePair()
                this.respawnCount++
            })
        }
    }

    private shouldRespawnTiles(): boolean {
        if (this.respawnCount >= this.MAX_RESPAWNS_PER_LEVEL) {
            return false
        }

        if (this.respawnCount === 0 && this.matchedPairsCount === this.FIRST_RESPAWN_THRESHOLD) {
            return true
        }

        if (this.respawnCount > 0) {
            const pairsAfterFirstRespawn = this.matchedPairsCount - this.FIRST_RESPAWN_THRESHOLD
            const expectedRespawns = Math.floor(
                pairsAfterFirstRespawn / this.SUBSEQUENT_RESPAWN_INTERVAL
            )
            return expectedRespawns > this.respawnCount - 1
        }

        return false
    }

    private respawnRandomTilePair(): void {
        if (this.listPair.length < 2) return

        const availablePairs: number[] = []
        for (let i = 0; i < this.listPair.length - 1; i += 2) {
            availablePairs.push(i)
        }

        if (availablePairs.length === 0) {
            this.respawnRandomMatchingTiles()
            return
        }

        const randomPairIndex = availablePairs[Math.floor(Math.random() * availablePairs.length)]
        const idx1 = randomPairIndex
        const idx2 = randomPairIndex + 1

        this.respawnTileAt(idx1)
        this.respawnTileAt(idx2)

        this.listPair.splice(idx2, 1)
        this.listPair.splice(idx1, 1)
    }

    private respawnRandomMatchingTiles(): void {
        const tilesByType: { [key: string]: number[] } = {}

        this.listPair.forEach((pair, index) => {
            const typeKey = `${pair.type}_${pair.theme}`
            if (!tilesByType[typeKey]) {
                tilesByType[typeKey] = []
            }
            tilesByType[typeKey].push(index)
        })

        const availableTypes = Object.keys(tilesByType).filter(
            (type) => tilesByType[type].length >= 2
        )

        if (availableTypes.length === 0) return

        const selectedType = availableTypes[Math.floor(Math.random() * availableTypes.length)]
        const tilesOfType = tilesByType[selectedType]

        const idx1 = tilesOfType[Math.floor(Math.random() * tilesOfType.length)]
        let idx2 = tilesOfType[Math.floor(Math.random() * tilesOfType.length)]

        while (idx2 === idx1 && tilesOfType.length > 1) {
            idx2 = tilesOfType[Math.floor(Math.random() * tilesOfType.length)]
        }

        this.respawnTileAt(idx1)
        this.respawnTileAt(idx2)

        const indicesToRemove = [idx1, idx2].sort((a, b) => b - a)
        indicesToRemove.forEach((index) => {
            this.listPair.splice(index, 1)
        })
    }

    private respawnTileAt(index: number): void {
        const pairInfo = this.listPair[index]
        if (!pairInfo) return

        pairInfo.tile.show()
        pairInfo.tile.reSpawn()
        pairInfo.tile.setTypeID(pairInfo.type)
        pairInfo.tile.setTheme(pairInfo.theme)
        pairInfo.tile.setCoordinate(pairInfo.position)
    }

    public getMatchedPairsCount(): number {
        return this.matchedPairsCount
    }

    public getRespawnCount(): number {
        return this.respawnCount
    }

    public getRemainingRespawns(): number {
        return this.MAX_RESPAWNS_PER_LEVEL - this.respawnCount
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

        type State = {
            pos: Vec2
            dirIndex: number
            turn: number
            path: Vec2[]
            g: number // cost so far
            f: number // estimated total cost
        }

        // visited[y][x][dir] = min turn
        const visited = Array.from({ length: height }, () =>
            Array.from({ length: width }, () => Array(4).fill(Infinity))
        )

        const heuristic = (p: Vec2) => Math.abs(p.x - end.x) + Math.abs(p.y - end.y)

        const open: State[] = []

        // Khởi tạo từ start
        for (let d = 0; d < 4; d++) {
            const next = start.clone().add(directions[d])
            if (!this.validate(next, end)) continue

            visited[next.y][next.x][d] = 0
            open.push({
                pos: next,
                dirIndex: d,
                turn: 0,
                path: [start.clone(), next.clone()],
                g: 1,
                f: 1 + heuristic(next),
            })
        }

        while (open.length > 0) {
            // Lấy node có f nhỏ nhất
            open.sort((a, b) => a.f - b.f)
            const current = open.shift()!

            if (current.pos.equals(end)) {
                return { path: current.path, turnNum: current.turn }
            }

            for (let d = 0; d < 4; d++) {
                const newTurn = d === current.dirIndex ? current.turn : current.turn + 1
                if (newTurn > 2) continue

                const next = current.pos.clone().add(directions[d])
                if (!this.validate(next, end)) continue
                if (visited[next.y][next.x][d] <= newTurn) continue

                visited[next.y][next.x][d] = newTurn

                const g = current.g + 1
                const f = g + heuristic(next)

                open.push({
                    pos: next,
                    dirIndex: d,
                    turn: newTurn,
                    path: [...current.path, next.clone()],
                    g,
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

        return (
            tile == null || tile.getTypeID() === TileType.NONE || tile === this.board[end.y][end.x]
        )
    }

    public setUpManager(game: TileConnect.IGameManager): void {
        this.game = game as GameManager
        for (const row of this.board) {
            for (const tile of row)
                tile.addOnClickCallback((tile: TileConnect.ITile) => game.choose(tile))
        }
    }

    public shake() {
        tween(this.node).to
    }

    public create(pool: TilePool, level: Level): void {
        pool.returnAll()
        const extra = 1
        const height = level.gridHeight + extra * 2
        const width = level.gridWidth + extra * 2
        this.board = []
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
                    if (tile?.node) {
                        Tween.stopAllByTarget(tile.wholeSprite!)
                    }
                    tile?.reScale(level.scale)
                } else {
                    tile?.hide()
                }

                tile?.setCoordinate(new Vec2(x, y))
                tile?.node.setPosition(/*getTilePositionByLevel(x, y, level, 1).x*/ 0, 0)
                tile?.fadeIn(Math.abs(y - level.gridHeight - 1) * 0.05)
                tile?.moveToRealPositionWithPadding(
                    level,
                    true,
                    Math.abs(y - level.gridHeight - 1) * 0.05,
                    'sineOut'
                )
            }
        }
    }

    public shuffle() {
        console.log('shuffle')
        if (this.shuffling) return
        this.shuffling = true
        const flatten: Tile[] = []
        this.game?.stopHint()

        // Collect all non-NONE tiles into flatten array
        for (const row of this.board) {
            for (const tile of row) {
                if (tile.getTypeID() !== TileType.NONE) {
                    flatten.push(tile as Tile)
                }
            }
        }

        // Fisher–Yates shuffle
        for (let i = flatten.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[flatten[i], flatten[j]] = [flatten[j], flatten[i]]
        }

        // Reassign shuffled tiles back to the board, skipping NONEs
        let index = 0
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                if (this.board[i][j].getTypeID() !== TileType.NONE) {
                    const shuffledTile = flatten[index++]
                    this.board[i][j] = shuffledTile

                    shuffledTile.setCoordinate(new Vec2(j, i))
                }
            }
        }
        for (const row of this.board) {
            for (const tile of row) {
                ;(tile as Tile).moveToRealPositionWithPadding(
                    this.game?.currentLevel!,
                    true,
                    0,
                    'expoInOut',
                    1
                )
            }
        }
        Promise.all(AnimationHandler.animTile).then(() => {
            this.shuffling = false
        })
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

    public drawPath(path: Vec2[], pool: PathPool) {
        for (let i = 0; i < path.length - 1; i++) {
            const from = path[i]
            const posFrom = (this.board[from.y][from.x] as Tile).node.getPosition().toVec2()

            const to = path[i + 1]
            const posTo = (this.board[to.y][to.x] as Tile).node.getPosition().toVec2()
            const p = pool.getFirstItem()
            console.log('from: ', posFrom, 'to: ', posTo)
            p?.createPath(posFrom, posTo)
            console.log('draw path from', from, 'to', to)
        }
    }

    public putStar(path: Vec2[], pool: StarPool) {
        for (let i = 0; i < path.length; i++) {
            const from = path[i]
            const pos = (this.board[from.y][from.x] as Tile).node.getPosition().clone()
            const star = pool.getFirstItem()
            if (i == 0 || i == path.length - 1) {
                star?.firstAndLastMatch()
            }
            star?.putAt(pos)
        }
    }
}

export default Board
