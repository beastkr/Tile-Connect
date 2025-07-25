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
    private currentLevel!: Level;
    private current: number = 1;
    private needToChange: boolean = false;
    private data: LevelData | null = null;
    private shuffleLevel: ShuffleLevel | null = null;
    private maxLevel: number = 100; 
    
    constructor() {
        this.loadLevel(this.current);
    }

    public checkNeedToChange(condition: 'completed' | 'failed' | 'skip'): void {
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

    private async loadLevelData(levelNumber: number): Promise<LevelData | null> {
    return new Promise((resolve, reject) => {
        const path = `map/map/level_${levelNumber}`;
        resources.load(path, JsonAsset, (err, asset) => {
            if (err) {
                console.error(`Không load được level ${levelNumber}:`, err);
                resolve(null);
            } else {
                const data = asset!.json as LevelData;
                resolve(data);
            }
        });
    });
}

    private async loadLevel(levelNumber: number): Promise<boolean> {
        const levelData = await this.loadLevelData(levelNumber);
        
        if (!levelData) {
            console.error(`Không thể load level ${levelNumber}`);
            return false;
        }

        this.data = levelData;
        this.shuffleLevel = new ShuffleLevel(levelData);
        
        const shuffleResult = this.shuffleLevel.shuffleUntilGood(50);
        
        if (!shuffleResult.success) {
            console.warn(`Level ${levelNumber} không thể tạo grid phù hợp sau ${shuffleResult.attempts} lần thử`);
        }

        const layerMap = this.shuffleLevel.getMapLayer(shuffleResult.grid);
        
        const theme = this.getThemeFromString(levelData.Theme);
        
       if(!this.currentLevel) {this.currentLevel = new Level(
            levelData.GridHeight,
            levelData.GridWidth,
            shuffleResult.grid,
            theme,
            layerMap
        );
                console.log(this.currentLevel)

    }
        else{
            this.currentLevel.change( levelData.GridHeight,
            levelData.GridWidth,
            shuffleResult.grid,
            theme,
            layerMap)
        }

        console.log(`Level ${levelNumber} đã được load thành công (${shuffleResult.attempts} attempts)`);
        return true;
    }

    private getThemeFromString(themeString: string): Theme {
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

    public async changeLevel(): Promise<boolean> {
        if (!this.needToChange) {
            console.log("Không cần change level");
            return false;
        }

        const nextLevel = this.current + 1;
        if (nextLevel > this.maxLevel) {
            console.log("Đã hoàn thành tất cả level!");
            return false;
        }

        const success = await this.loadLevel(nextLevel);
        
        if (success) {
            this.current = nextLevel;
            this.needToChange = false;
            return true;
        }
        
        return false;
    }

    public async jumpToLevel(levelNumber: number): Promise<boolean> {
        if (levelNumber < 1 || levelNumber > this.maxLevel) {
            console.error(`Level ${levelNumber} không hợp lệ (1-${this.maxLevel})`);
            return false;
        }

        const success = await this.loadLevel(levelNumber);
        
        if (success) {
            this.current = levelNumber;
            this.needToChange = false;
            console.log(`Jump đến level ${this.current}`);
            return true;
        }
        
        return false;
    }

    public async restartLevel(): Promise<boolean> {
        return await this.loadLevel(this.current);
    }

    public async previousLevel(): Promise<boolean> {
        if (this.current <= 1) {
            console.log("Đã ở level đầu tiên");
            return false;
        }

        const prevLevel = this.current - 1;
        const success = await this.loadLevel(prevLevel);
        
        if (success) {
            this.current = prevLevel;
            this.needToChange = false;
            console.log(`Quay lại level ${this.current}`);
            return true;
        }
        
        return false;
    }

    // Getters
    public getCurrentLevel(): Level {
        return this.currentLevel;
    }

    public getCurrentLevelNumber(): number {
        return this.current;
    }

    public getNeedToChange(): boolean {
        return this.needToChange;
    }

    public getLevelData(): LevelData | null {
        return this.data;
    }

    public getShuffleLevel(): ShuffleLevel | null {
        return this.shuffleLevel;
    }

    // Setters
    public setNeedToChange(value: boolean): void {
        this.needToChange = value;
    }

    public setMaxLevel(max: number): void {
        this.maxLevel = max;
    }
}