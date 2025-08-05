import { JsonAsset, resources } from 'cc'
import { Theme } from '../../type/global'
import { TileConnect } from '../../type/type'
import { Level } from './Level'
import { ShuffleLevel } from './ShuffleLevel'

export class LevelLoader {
    private static instance: LevelLoader | null = null
    private currentLevel: Level | null = null
    private current: number = 5
    private needToChange: boolean = false
    private data: TileConnect.ILevelData | null = null
    private shuffleLevel: ShuffleLevel | null = null
    private maxLevel: number = 100

    private constructor() {
        this.loadLevel(this.current)
    }

    public static getInstance(): LevelLoader {
        if (!LevelLoader.instance) {
            LevelLoader.instance = new LevelLoader()
        }
        return LevelLoader.instance
    }

    public checkNeedToChange(condition: 'completed' | 'failed' | 'skip'): void {
        switch (condition) {
            case 'completed':
                this.needToChange = true
                break
            case 'failed':
                this.needToChange = false
                break
            case 'skip':
                this.needToChange = true
                break
        }
    }

    private async loadLevelData(levelNumber: number): Promise<TileConnect.ILevelData | null> {
        return new Promise((resolve, reject) => {
            const path = `map/map/level${levelNumber}`
            resources.load(path, JsonAsset, (err, asset) => {
                if (err) {
                    console.error(`Không load được level ${levelNumber}:`, err)
                    console.log('Test load:', err, asset)
                    resolve(null)
                } else {
                    const data = asset!.json as TileConnect.ILevelData
                    resolve(data)
                }
            })
        })
    }

    private async loadLevel(levelNumber: number): Promise<boolean> {
        const levelData = await this.loadLevelData(levelNumber)

        if (!levelData) {
            console.error(`Không thể load level ${levelNumber}`)
            return false
        }

        this.data = levelData
        this.shuffleLevel = new ShuffleLevel(levelData)
        const grid = this.shuffleLevel.generateMap()
        const layers = this.shuffleLevel.getMapLayer(grid)
        const theme = this.getThemeFromString(levelData.Theme)

        if (!this.currentLevel) {
            this.currentLevel = new Level(
                levelData.GridHeight,
                levelData.GridWidth,
                grid,
                theme,
                levelData.Time,
                levelData.Gravity,
                levelData.Circle,
                layers
            )
            console.log(this.currentLevel)
        } else {
            this.currentLevel.change(
                levelData.GridHeight,
                levelData.GridWidth,
                grid,
                theme,
                levelData.Time,
                levelData.Gravity,
                levelData.Circle,
                layers
            )
        }

        return true
    }

    private getThemeFromString(themeString: string): Theme {
        switch (themeString.toUpperCase()) {
            case 'CAKE':
                return Theme.CAKE
            case 'FRUIT':
                return Theme.FRUIT
            case 'BUTTERFLY':
                return Theme.BUTTERFLY
            case 'DRINK':
                return Theme.DRINK
            default:
                return Theme.CAKE
        }
    }

    public async changeLevel(): Promise<boolean> {
        if (!this.needToChange) {
            console.log('Không cần change level')
            return false
        }

        const nextLevel = this.current + 1
        if (nextLevel > this.maxLevel) {
            console.log('Đã hoàn thành tất cả level!')
            return false
        }

        const success = await this.loadLevel(nextLevel)

        if (success) {
            this.current = nextLevel
            this.needToChange = false
            return true
        }

        return false
    }

    public async jumpToLevel(levelNumber: number): Promise<boolean> {
        if (levelNumber < 1 || levelNumber > this.maxLevel) {
            console.error(`Level ${levelNumber} không hợp lệ (1-${this.maxLevel})`)
            return false
        }

        const success = await this.loadLevel(levelNumber)

        if (success) {
            this.current = levelNumber
            this.needToChange = false
            console.log(`Jump đến level ${this.current}`)
            return true
        }

        return false
    }

    public async restartLevel(): Promise<boolean> {
        return await this.loadLevel(this.current)
    }

    public async previousLevel(): Promise<boolean> {
        if (this.current <= 1) {
            console.log('Đã ở level đầu tiên')
            return false
        }

        const prevLevel = this.current - 1
        const success = await this.loadLevel(prevLevel)

        if (success) {
            this.current = prevLevel
            this.needToChange = false
            console.log(`Quay lại level ${this.current}`)
            return true
        }

        return false
    }

    // Getters
    public getCurrentLevel(): Level {
        return this.currentLevel!
    }

    public getCurrentLevelNumber(): number {
        return this.current
    }

    public getNeedToChange(): boolean {
        return this.needToChange
    }

    public getLevelData(): TileConnect.ILevelData | null {
        return this.data
    }

    public getShuffleLevel(): ShuffleLevel | null {
        return this.shuffleLevel
    }

    // Setters
    public setNeedToChange(value: boolean): void {
        this.needToChange = value
    }

    public setMaxLevel(max: number): void {
        this.maxLevel = max
    }
}
