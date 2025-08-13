
import { _decorator, Component, director, Size, Tween, tween, Vec2, Vec3 } from 'cc'
import { SFX, Theme } from './../../type/global'


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

import InvalidPool from '../pool/InvalidPool'
import NopePool from '../pool/NopePool'
import { TutorialManager } from '../manager/TutorialManager'

import { SoundManager } from '../manager/SoundManager'

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
    game: GameManager | null = null

    private matchedPairsCount: number = 0
    private respawnCount: number = 0
    private readonly MAX_RESPAWNS_PER_LEVEL: number = 3
    private readonly FIRST_RESPAWN_THRESHOLD: number = 5
    private readonly SUBSEQUENT_RESPAWN_INTERVAL: number = 3

    public match(tile1: Tile, tile2: Tile): void {
        if (tile1.underKill || tile2.underKill) return
        console.log('itemList: ', this.game?.pathPool)
        const path = this.getPath(tile1, tile2)
        if (this.canMatch(tile1, tile2, path.path, path.turnNum)) {

            this.drawPath(path.path, this.game?.pathPool!)
            this.putStar(path.path, this.game?.starPool!)

            tile1.onDead(this, true, tile2)
            tile2.onDead(this, false, tile1)
            tile1.kill()
            tile2.kill()

            this.matchedPairsCount++
            this.checkAndRespawnTiles()
            if (!this.hasAnyValidPair()) {
                console.log('No valid pairs left — shuffling board')
                this.shuffle()
            }
        } else {
            ; (this.game?.tilePool as TilePool).shake(10, this.game!.currentLevel)
            if (this.game!.currentNumber() < 2) {
                let path = this.getInvalidPath(tile1, tile2)
                if (path.path.length === 0) {
                    path = this.getPath(tile1, tile2, false)
                    if (path.path.length === 0) {
                        path = this.getPath(tile2, tile1, false)
                    }
                    TutorialManager.instance?.showObstacle()
                    const reducePath = this.getTurnPoints(path!.path)
                    this.drawInvalid(reducePath, this.game?.invalid!)
                    this.putNope(reducePath, this.game?.nope!)
                    this.game?.unChoose()
                    SoundManager.instance.playSFX(SFX.INVALID_MATCH)
                    return
                }
                const reducePath = this.getTurnPoints(path!.path)
                this.drawInvalid(reducePath, this.game?.invalid!)
                this.putNope(reducePath, this.game?.nope!)
                TutorialManager.instance?.showInvalid()

                console.log(reducePath)
            }

            ; (this.game?.tilePool as TilePool).shake(10, this.game!.currentLevel)
            SoundManager.instance.playSFX(SFX.INVALID_MATCH)

            navigator.vibrate(1000); // vibrate 200ms




            this.game?.unChoose()
        }
    }
    private getTurnPoints(path: Vec2[]): Vec2[] {
        if (path.length < 2) return path

        const turns = [path[0]]

        for (let i = 1; i < path.length - 1; i++) {
            const prev = path[i - 1]
            const curr = path[i]
            const next = path[i + 1]

            const dx1 = curr.x - prev.x
            const dy1 = curr.y - prev.y
            const dx2 = next.x - curr.x
            const dy2 = next.y - curr.y

            // If direction changes, it's a turn
            if (dx1 !== dx2 || dy1 !== dy2) {
                turns.push(curr)
            }
        }

        turns.push(path[path.length - 1]) // Always include the end
        return turns
    }
    private checkAndRespawnTiles(): void {
        const levelData = LevelLoader.getInstance().getLevelData()
        if (!levelData || levelData.Difficulty < 3) {
            return
        }
        const shouldRespawn = this.shouldRespawnTiles()

        if (shouldRespawn) {
            this.respawnRandomTilePair()
            this.respawnCount++
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
        const availablePositions = this.getAvailableRandomPosInGameArea()

        if (!availablePositions || availablePositions.length < 2) {
            return
        }

        this.shuffleArray(availablePositions)

        const pos1 = availablePositions[0]
        const pos2 = availablePositions[1]
        const randomType = Math.floor(Math.random() * 7) + 1

        this.findAndRespawnTileAt(pos1, randomType)
        this.findAndRespawnTileAt(pos2, randomType)
    }

    private getAvailableRandomPosInGameArea(): Vec2[] {
        const availablePositions: Vec2[] = []
        const extra = 1

        const level = this.game?.currentLevel
        if (!level) return availablePositions

        const startY = extra
        const endY = extra + level.gridHeight
        const startX = extra
        const endX = extra + level.gridWidth

        for (let i = startY; i < endY; i++) {
            for (let j = startX; j < endX; j++) {
                if (this.board[i][j].getTypeID() === TileType.NONE) {
                    availablePositions.push(this.board[i][j].getCoordinate())
                }
            }
        }

        return availablePositions
    }

    private shuffleArray<T>(array: T[]): void {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
                ;[array[i], array[j]] = [array[j], array[i]]
        }
    }

    private findAndRespawnTileAt(position: Vec2, num: number): void {
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                if (this.board[i][j].getCoordinate().equals(position)) {
                    this.board[i][j].reSpawn()
                    this.board[i][j].setTypeID(num)
                    if (this.game?.currentLevel.theme == Theme.BUTTERFLY) {
                        const butterfly = this.game.subtilePool.get(SubType.BUTTERFLY)?.getFirstItem()
                        this.board[i][j].attachSubType(butterfly!, SubType.BUTTERFLY)
                    }
                    this.board[i][j].show()
                    return
                }
            }
        }
    }

    public getMatchedPairsCount(): number {
        return this.matchedPairsCount
    }

    public getRespawnCount(): number {
        return this.respawnCount
    }
    private hasAnyValidPair(): boolean {
        const height = this.board.length
        const width = this.board[0].length

        for (let y1 = 0; y1 < height; y1++) {
            for (let x1 = 0; x1 < width; x1++) {
                const tile1 = this.board[y1][x1] as Tile
                if (!tile1 || tile1.getTypeID() === TileType.NONE) continue

                for (let y2 = 0; y2 < height; y2++) {
                    for (let x2 = 0; x2 < width; x2++) {
                        if (x1 === x2 && y1 === y2) continue

                        const tile2 = this.board[y2][x2] as Tile
                        if (!tile2 || tile2.getTypeID() === TileType.NONE) continue
                        const path = this.getPath(tile1, tile2)
                        if (
                            tile1.getTypeID() === tile2.getTypeID() &&
                            this.canMatch(tile1, tile2, path.path, path.turnNum)
                        ) {
                            return true
                        }
                    }
                }
            }
        }

        return false
    }

    public getRemainingRespawns(): number {
        return this.MAX_RESPAWNS_PER_LEVEL - this.respawnCount
    }

    public canMatch(tile1: Tile, tile2: Tile, path: Vec2[], turnNum: number): boolean {
        if (tile1.getTypeID() !== tile2.getTypeID()) return false
        if (tile1 === tile2) return false

        console.log(path)
        return path.length > 0 && turnNum <= 2
    }

    public getInvalidPath(tile1: Tile, tile2: Tile): { path: Vec2[]; turnNum: number } {
        const start = tile1.getCoordinate()
        const end = tile2.getCoordinate()
        const height = this.board.length
        const width = this.board[0].length

        const directions = [new Vec2(-1, 0), new Vec2(1, 0), new Vec2(0, 1), new Vec2(0, -1)]

        const visited = Array.from({ length: height }, () =>
            Array.from({ length: width }, () => false)
        )

        const dfs = (
            current: Vec2,
            currentPath: Vec2[],
            turns: number,
            lastDir: number
        ): { path: Vec2[]; turns: number } | null => {
            if (current.equals(end)) {
                return { path: [...currentPath, current.clone()], turns }
            }

            if (turns > 2) return null

            visited[current.y][current.x] = true

            for (let i = 0; i < directions.length; i++) {
                const next = current.clone().add(directions[i])

                if (!this.validate(next, end) || visited[next.y][next.x]) continue

                const newTurns = i === lastDir || lastDir === -1 ? turns : turns + 1

                const result = dfs(next, [...currentPath, current.clone()], newTurns, i)
                if (result) {
                    visited[current.y][current.x] = false
                    return result
                }
            }

            visited[current.y][current.x] = false // Backtrack
            return null
        }

        const result = dfs(start, [], 0, -1)
        return result ? { path: result.path, turnNum: result.turns } : { path: [], turnNum: 0 }
    }

    public getPath(
        tile1: Tile,
        tile2: Tile,
        validCheck: boolean = true
    ): { path: Vec2[]; turnNum: number } {
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
            if (validCheck && !this.validate(next, end)) continue

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
    public resetInputExcept(tile1: Tile, tile2: Tile) {
        for (const row of this.board) {
            for (const tile of row) {
                tile.clearOnClickCallbacks()
            }
        }
        tile1.addOnClickCallback((tile: TileConnect.ITile) => this.game?.choose(tile))
        tile2.addOnClickCallback((tile: TileConnect.ITile) => this.game?.choose(tile))
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
                if ((tile as Tile).onClickCallbacks.length == 0)
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
        this.matchedPairsCount = 0
        this.respawnCount = 0
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
                    if (tile?.getTypeID() == TileType.NONE) tile.hide()
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
        this.game?.stopHint()

        // === 1. Gom tất cả các tile không phải NONE vào mảng flatten ===
        const flatten: Tile[] = []
        for (const row of this.board) {
            for (const tile of row) {
                if (tile.getTypeID() !== TileType.NONE) {
                    flatten.push(tile as Tile)
                }
            }
        }

        // === 2. Gom nhóm tile theo loại để chọn 2 tile cùng loại ===
        const typeGroups: Record<number, Tile[]> = {}
        for (const tile of flatten) {
            const type = tile.getTypeID()
            if (!typeGroups[type]) typeGroups[type] = []
            typeGroups[type].push(tile)
        }

        const availableTypes = Object.keys(typeGroups).filter((t) => typeGroups[+t].length >= 2)

        // === 3. Tìm tất cả các cặp vị trí liền kề không phải NONE ===
        const neighborPositions: [number, number, number, number][] = []
        for (let y = 0; y < this.board.length; y++) {
            for (let x = 0; x < this.board[y].length; x++) {
                if (this.board[y][x].getTypeID() === TileType.NONE) continue

                if (
                    x + 1 < this.board[y].length &&
                    this.board[y][x + 1].getTypeID() !== TileType.NONE
                ) {
                    neighborPositions.push([x, y, x + 1, y])
                }

                if (
                    y + 1 < this.board.length &&
                    this.board[y + 1][x].getTypeID() !== TileType.NONE
                ) {
                    neighborPositions.push([x, y, x, y + 1])
                }
            }
        }

        // === 4. Nếu có đủ tile và vị trí, chọn 2 tile cùng loại và vị trí để đặt cặp match ===
        let chosenTiles: Tile[] = []
        let neighborPos: [number, number, number, number] | null = null

        if (availableTypes.length > 0 && neighborPositions.length > 0) {
            const chosenType = +availableTypes[Math.floor(Math.random() * availableTypes.length)]
            chosenTiles = typeGroups[chosenType].splice(0, 2)

            // Xoá 2 tile này khỏi flatten
            for (const t of chosenTiles) {
                const idx = flatten.indexOf(t)
                if (idx >= 0) flatten.splice(idx, 1)
            }

            neighborPos = neighborPositions[Math.floor(Math.random() * neighborPositions.length)]
        }

        // === 5. Shuffle phần còn lại ===
        for (let i = flatten.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
                ;[flatten[i], flatten[j]] = [flatten[j], flatten[i]]
        }

        // === 6. Gán lại tile vào board ===
        let index = 0
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                if (this.board[i][j].getTypeID() !== TileType.NONE) {
                    let tile: Tile | undefined

                    // Nếu đây là vị trí được chọn cho cặp match
                    if (
                        neighborPos &&
                        chosenTiles.length === 2 &&
                        ((i === neighborPos[1] && j === neighborPos[0]) ||
                            (i === neighborPos[3] && j === neighborPos[2]))
                    ) {
                        tile =
                            i === neighborPos[1] && j === neighborPos[0]
                                ? chosenTiles[0]
                                : chosenTiles[1]
                    } else {
                        tile = flatten[index++]
                    }

                    if (!tile) {
                        console.warn(`⚠️ Thiếu tile để gán tại (${i}, ${j})`)
                        continue
                    }

                    this.board[i][j] = tile
                    tile.setCoordinate(new Vec2(j, i))
                }
            }
        }

        // === 7. Animate toàn bộ tile ===
        for (const row of this.board) {
            for (const tile of row) {
                if (tile && tile.getTypeID() !== TileType.NONE) {
                    ; (tile as Tile).moveToRealPositionWithPadding(
                        this.game?.currentLevel!,
                        true,
                        0,
                        'expoInOut',
                        1
                    )
                }
            }
        }

        // === 8. Kết thúc shuffle khi animation hoàn tất ===
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
            p?.createPath(posFrom, posTo, true, 0.6)
            console.log('draw path from', from, 'to', to)
        }
    }
    public drawInvalid(path: Vec2[], pool: InvalidPool) {
        for (let i = 0; i < path.length - 1; i++) {
            const from = path[i]
            const posFrom = (this.board[from.y][from.x] as Tile).node.getPosition().toVec2()

            const to = path[i + 1]
            const posTo = (this.board[to.y][to.x] as Tile).node.getPosition().toVec2()
            const p = pool.getFirstItem()
            console.log('drew')
            p?.createPath(posFrom, posTo)
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
            star?.putAt(pos, i)
        }
    }
    public putNope(path: Vec2[], pool: NopePool) {
        if (path.length < 3) {
            const from = path[0]
            const end = path[1]
            const fromPos = (this.board[from.y][from.x] as Tile).node.getPosition()
            const endPos = (this.board[end.y][end.x] as Tile).node.getPosition()
            const pos = new Vec3((fromPos.x + endPos.x) / 2, (fromPos.y + endPos.y) / 2, 1)
            const star = pool.getFirstItem()
            star?.putAt(pos)
            return
        }
        for (let i = 1; i < path.length - 1; i++) {
            const from = path[i]
            const pos = (this.board[from.y][from.x] as Tile).node.getPosition().clone()
            const star = pool.getFirstItem()
            if (i < 3) {
                star?.putX(pos, i)
            } else {
                star?.putAt(pos)
            }
        }
    }
}

export default Board
