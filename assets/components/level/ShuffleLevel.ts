import { Direction, SubType } from '../../type/global'
import { GravityManager } from '../manager/GravityManager'

interface Position {
    x: number
    y: number
}

interface TilePair {
    tileId: number
    positions: Position[]
}

export class ShuffleLevel {
    private gridHeight: number
    private gridWidth: number
    private data: any
    private RocketTile: number
    private difficulty: number
    private Timer: number
    private grid: number[][] = []
    private layerList: Map<SubType, number[][]> = new Map()

    constructor(data: any) {
        this.gridHeight = data.GridHeight
        this.gridWidth = data.GridWidth
        this.RocketTile = data.Tiles.RocketTiles
        this.difficulty = data.Difficulty
        this.Timer = data.Time
        this.data = data
    }

    public changeLevel(data: any) {
        this.gridHeight = data.GridHeight
        this.gridWidth = data.GridWidth
        this.RocketTile = data.Tiles.RocketTiles
        this.difficulty = data.Difficulty
        this.Timer = data.Time
        this.data = data
    }

    public shuffle(): number[][] {
        this.grid = Array(this.gridHeight)
            .fill(null)
            .map(() => Array(this.gridWidth).fill(-1))

        const tilePairs: TilePair[] = []

        Object.entries(this.data.Tiles.NormalTiles).forEach(([tileId, count]) => {
            const pairs = Math.floor(Number(count) / 2)
            for (let i = 0; i < pairs; i++) {
                tilePairs.push({
                    tileId: parseInt(tileId),
                    positions: [],
                })
            }
        })

        const rocketPairs = Math.floor(this.RocketTile / 2)
        for (let i = 0; i < rocketPairs; i++) {
            tilePairs.push({
                tileId: 8,
                positions: [],
            })
        }

        const shuffledPairs = this.shuffleArray([...tilePairs])

        const totalPairs = shuffledPairs.length
        const strategicPairs = Math.floor((totalPairs * 2) / 3)
        const randomPairs = totalPairs - strategicPairs

        const allPositions = this.getAllPositions()
        const availablePositions = [...allPositions]

        for (let i = 0; i < strategicPairs; i++) {
            const pair = shuffledPairs[i]
            const positions = this.getStrategicPositions(availablePositions, this.difficulty)

            pair.positions = positions
            positions.forEach((pos) => {
                this.grid[pos.y][pos.x] = pair.tileId
                const index = availablePositions.findIndex((p) => p.x === pos.x && p.y === pos.y)
                if (index > -1) availablePositions.splice(index, 1)
            })
        }

        for (let i = strategicPairs; i < totalPairs; i++) {
            const pair = shuffledPairs[i]
            const positions: Position[] = []

            for (let j = 0; j < 2 && availablePositions.length > 0; j++) {
                const randomIndex = Math.floor(Math.random() * availablePositions.length)
                const pos = availablePositions.splice(randomIndex, 1)[0]
                positions.push(pos)
                this.grid[pos.y][pos.x] = pair.tileId
            }

            pair.positions = positions
        }

        return this.grid
    }

    private getStrategicPositions(availablePositions: Position[], difficulty: number): Position[] {
        if (availablePositions.length < 2) {
            return availablePositions.splice(0, 2)
        }

        const isEasyMode = difficulty <= 2

        if (isEasyMode) {
            return this.getDistantPositions(availablePositions)
        } else {
            return this.getDistantPositions(availablePositions)
        }
    }

    private getNearbyPositions(availablePositions: Position[]): Position[] {
        let bestPair: Position[] = []
        let minDistance = Infinity

        for (let i = 0; i < availablePositions.length; i++) {
            for (let j = i + 1; j < availablePositions.length; j++) {
                const pos1 = availablePositions[i]
                const pos2 = availablePositions[j]
                const distance = this.calculateDistance(pos1, pos2)

                if (distance < minDistance) {
                    minDistance = distance
                    bestPair = [pos1, pos2]
                }
            }
        }

        bestPair.forEach((pos) => {
            const index = availablePositions.findIndex((p) => p.x === pos.x && p.y === pos.y)
            if (index > -1) availablePositions.splice(index, 1)
        })

        return bestPair.length === 2 ? bestPair : this.getRandomPositions(availablePositions, 2)
    }

    private getDistantPositions(availablePositions: Position[]): Position[] {
        let bestPair: Position[] = []
        let maxDistance = 0

        for (let i = 0; i < availablePositions.length; i++) {
            for (let j = i + 1; j < availablePositions.length; j++) {
                const pos1 = availablePositions[i]
                const pos2 = availablePositions[j]
                const distance = this.calculateDistance(pos1, pos2)

                if (distance > maxDistance) {
                    maxDistance = distance
                    bestPair = [pos1, pos2]
                }
            }
        }

        bestPair.forEach((pos) => {
            const index = availablePositions.findIndex((p) => p.x === pos.x && p.y === pos.y)
            if (index > -1) availablePositions.splice(index, 1)
        })

        return bestPair.length === 2 ? bestPair : this.getRandomPositions(availablePositions, 2)
    }

    private calculateDistance(pos1: Position, pos2: Position): number {
        return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y)
    }

    private getRandomPositions(availablePositions: Position[], count: number): Position[] {
        const result: Position[] = []
        for (let i = 0; i < count && availablePositions.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availablePositions.length)
            result.push(availablePositions.splice(randomIndex, 1)[0])
        }
        return result
    }

    public isEasyEnough(): boolean {
        let adjacentPairs = 0

        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.grid[y][x] === -1) continue

                if (x < this.gridWidth - 1 && this.grid[y][x] === this.grid[y][x + 1]) {
                    adjacentPairs++
                }

                if (y < this.gridHeight - 1 && this.grid[y][x] === this.grid[y + 1][x]) {
                    adjacentPairs++
                }
            }
        }

        if (this.difficulty <= 2) {
            return adjacentPairs >= 8
        } else if (this.difficulty <= 3.5) {
            return adjacentPairs >= 4 && adjacentPairs <= 8
        } else {
            return adjacentPairs <= 3
        }
    }

    public generateMap(): number[][] {
        return this.shuffle()
    }

    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array]
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled
    }

    private getAllPositions(): Position[] {
        const positions: Position[] = []
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                positions.push({ x, y })
            }
        }
        return positions
    }
    private checkDirection(): Direction {
        switch (this.data.Gravity) {
            case 0:
                return Direction.NONE
            case 1:
                return Direction.LEFT
            case 2:
                return Direction.RIGHT
            case 3:
                return Direction.UP
            case 4:
                return Direction.DOWN
            default:
                return Direction.NONE
        }
    }
    public getMapLayer(grid: number[][]): Map<SubType, number[][]> {
        const RocketLayer: number[][] = Array.from({ length: this.gridHeight }, () =>
            Array(this.gridWidth).fill(0)
        )
        const BoomLayer: number[][] = Array.from({ length: this.gridHeight }, () =>
            Array(this.gridWidth).fill(0)
        )
        const GravityLayer: number[][] = Array.from({ length: this.gridHeight }, () =>
            Array(this.gridWidth).fill(0)
        )
        const bombCandidates: { x: number; y: number }[] = []

        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                GravityManager.setCircle(this.data.Circle)
                if (this.data.Gravity) {
                    GravityLayer[y][x] = 1
                }
                if (grid[y][x] == 8) {
                    RocketLayer[y][x] = 1
                } else {
                    RocketLayer[y][x] = 0
                    bombCandidates.push({ x, y })
                }
            }
        }
        console.log(this.checkDirection())
        GravityManager.changeGravity(this.checkDirection())
        const bombCount = this.data.Tiles.BombEffects
        for (let i = 0; i < bombCount; i++) {
            const index = Math.floor(Math.random() * bombCandidates.length)
            const { x, y } = bombCandidates.splice(index, 1)[0]
            BoomLayer[y][x] = 1
        }

        this.layerList.set(SubType.ROCKET, RocketLayer)
        this.layerList.set(SubType.BOOM, BoomLayer)
        this.layerList.set(SubType.GRAVITY, GravityLayer)
        return this.layerList
    }

    public getGrid(): number[][] {
        return this.grid
    }
}
