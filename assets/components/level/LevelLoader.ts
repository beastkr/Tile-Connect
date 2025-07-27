import { Level } from "./Level";
import { ShuffleLevel } from "./ShuffleLevel";
import { Theme, SubType } from "../../type/global";
import { JsonAsset, resources } from "cc";

interface LevelData {
    GridHeight: number;
    GridWidth: number;
    Theme: string;
    Difficulty: number;
    Tiles: {
        NormalTiles: { [key: string]: number };
        RocketTiles: number;
        BombEffects: number;
    };
}

export class LevelLoader {
    private static currentLevel: Level;
    private static current: number = 5;
    private static needToChange: boolean = false;
    private static data: LevelData | null = null;
    private static shuffleLevel: ShuffleLevel | null = null;
    private static maxLevel: number = 100;

    constructor() {
        LevelLoader.loadLevel(LevelLoader.current);
    }

    public static checkNeedToChange(condition: 'completed' | 'failed' | 'skip'): void {
        switch (condition) {
            case 'completed':
                this.needToChange = true;
                break;
            case 'failed':
                this.needToChange = false;
                break;
            case 'skip':
                this.needToChange = true;
                break;
        }
    }

    private static async loadLevelData(levelNumber: number): Promise<LevelData | null> {
        return new Promise((resolve, reject) => {
            const path = `map/map/level_${levelNumber}`;
            resources.load(path, JsonAsset, (err, asset) => {
                if (err) {
                    console.error(`Không load được level ${levelNumber}:`, err);
                    resolve(null);
                } else {
                    const data = asset!.json as LevelData;
                    console.log(data.Theme)
                    resolve(data);
                }
            });
        });
    }

    private static async loadLevel(levelNumber: number): Promise<boolean> {
        const levelData = await this.loadLevelData(levelNumber);

        if (!levelData) {
            console.error(`Không thể load level ${levelNumber}`);
            return false;
        }

        this.data = levelData;
        this.shuffleLevel = new ShuffleLevel(levelData);

        const shuffleResult = this.shuffleLevel.shuffleUntilGood(50);

        if (!shuffleResult.success) {
            this.shuffleLevel.shuffle()
            const layerMap = this.shuffleLevel.getMapLayer(this.shuffleLevel.getGrid())

            const theme = LevelLoader.getThemeFromString(levelData.Theme);

            if (!LevelLoader.currentLevel) {
                LevelLoader.currentLevel = new Level(
                    levelData.GridHeight,
                    levelData.GridWidth,
                    shuffleResult.grid,
                    theme,
                    layerMap
                );
                console.log(LevelLoader.currentLevel)

            }
            else {
                LevelLoader.currentLevel.change(levelData.GridHeight,
                    levelData.GridWidth,
                    shuffleResult.grid,
                    theme,
                    layerMap)
            }
        }
        else {
            const layerMap = this.shuffleLevel.getMapLayer(shuffleResult.grid);

            const theme = this.getThemeFromString(levelData.Theme);

            if (!LevelLoader.currentLevel) {
                LevelLoader.currentLevel = new Level(
                    levelData.GridHeight,
                    levelData.GridWidth,
                    shuffleResult.grid,
                    theme,
                    layerMap
                );
                console.log(LevelLoader.currentLevel)

            }
            else {
                LevelLoader.currentLevel.change(levelData.GridHeight,
                    levelData.GridWidth,
                    shuffleResult.grid,
                    theme,
                    layerMap)
            }
        }


        console.log(`Level ${levelNumber} đã được load thành công (${shuffleResult.attempts} attempts)`);
        return true;
    }

    private static getThemeFromString(themeString: string): Theme {
        switch (themeString.toUpperCase()) {
            case 'CAKE':
                return Theme.CAKE;
            case 'FRUIT':
                return Theme.FRUIT;
            case 'BUTTERFLY':
                return Theme.BUTTERFLY;
            case 'DRINK':
                return Theme.DRINK;
            default:
                return Theme.CAKE;
        }
    }

    public static async changeLevel(): Promise<boolean> {
        if (!LevelLoader.needToChange) {
            console.log("Không cần change level");
            return false;
        }

        const nextLevel = LevelLoader.current + 1;
        if (nextLevel > this.maxLevel) {
            console.log("Đã hoàn thành tất cả level!");
            return false;
        }

        const success = await this.loadLevel(nextLevel);

        if (success) {
            LevelLoader.current = nextLevel;
            LevelLoader.needToChange = false;
            return true;
        }

        return false;
    }

    public async jumpToLevel(levelNumber: number): Promise<boolean> {
        if (levelNumber < 1 || levelNumber > LevelLoader.maxLevel) {
            console.error(`Level ${levelNumber} không hợp lệ (1-${LevelLoader.maxLevel})`);
            return false;
        }

        const success = await LevelLoader.loadLevel(levelNumber);

        if (success) {
            LevelLoader.current = levelNumber;
            LevelLoader.needToChange = false;
            console.log(`Jump đến level ${LevelLoader.current}`);
            return true;
        }

        return false;
    }

    public async restartLevel(): Promise<boolean> {
        return await LevelLoader.loadLevel(LevelLoader.current);
    }

    public async previousLevel(): Promise<boolean> {
        if (LevelLoader.current <= 1) {
            console.log("Đã ở level đầu tiên");
            return false;
        }

        const prevLevel = LevelLoader.current - 1;
        const success = await LevelLoader.loadLevel(prevLevel);

        if (success) {
            LevelLoader.current = prevLevel;
            LevelLoader.needToChange = false;
            console.log(`Quay lại level ${LevelLoader.current}`);
            return true;
        }

        return false;
    }

    // Getters
    public getCurrentLevel(): Level {
        return LevelLoader.currentLevel;
    }

    public getCurrentLevelNumber(): number {
        return LevelLoader.current;
    }

    public getNeedToChange(): boolean {
        return LevelLoader.needToChange;
    }

    public getLevelData(): LevelData | null {
        return LevelLoader.data;
    }

    public getShuffleLevel(): ShuffleLevel | null {
        return LevelLoader.shuffleLevel;
    }

    // Setters
    public setNeedToChange(value: boolean): void {
        LevelLoader.needToChange = value;
    }

    public setMaxLevel(max: number): void {
        LevelLoader.maxLevel = max;
    }
}