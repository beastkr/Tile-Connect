import { SubType } from "../../type/global";

interface Position {
    x: number;
    y: number;
}

export class ShuffleLevel {
    private gridHeight: number;
    private gridWidth: number;
    private data:any
    private RocketTile: number;
    private difficulty: number;
    private Timer:number;
    private grid: number[][] = [];
    private layerList: Map<SubType, number[][]> = new Map();
    constructor(data:any) {
        this.gridHeight = data.GridHeight;
        this.gridWidth = data.GridWidth;
        this.RocketTile = data.Tiles.RocketTiles;
        this.difficulty = data.Difficulty;
        this.Timer=data.Time;
        this.data=data

    }
    public changeLevel(data:any){
        this.gridHeight = data.GridHeight;
        this.gridWidth = data.GridWidth;
        this.RocketTile = data.Tiles.RocketTiles;
        this.difficulty = data.Difficulty;
        this.Timer=data.Time;

        this.data=data
    }
    public shuffle(): number[][] {
        this.grid = Array(this.gridHeight).fill(null).map(() =>
            Array(this.gridWidth).fill(-1)
        );

        const tilesToPlace: number[] = [];

        Object.entries(this.data.Tiles.NormalTiles).forEach(([tileId, count]) => {
            for (let i = 0; i < Number(count); i++) {
                tilesToPlace.push(parseInt(tileId));
            }
        });

        for (let i = 0; i < this.RocketTile; i++) {
            tilesToPlace.push(8);
        }

        const shuffledTiles = this.shuffleArray([...tilesToPlace]);
        const allPositions = this.getAllPositions();
        const shuffledPositions = this.shuffleArray(allPositions);

        for (let i = 0; i < shuffledTiles.length && i < shuffledPositions.length; i++) {
            const pos = shuffledPositions[i];
            this.grid[pos.y][pos.x] = shuffledTiles[i];
        }
        return this.grid;
    }

    public isEasyEnough(): boolean {
        let adjacentPairs = 0;

        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.grid[y][x] === -1) continue;

                if (x < this.gridWidth - 1 && this.grid[y][x] === this.grid[y][x + 1]) {
                    adjacentPairs++;
                }

                if (y < this.gridHeight - 1 && this.grid[y][x] === this.grid[y + 1][x]) {
                    adjacentPairs++;
                }
            }
        }

        if (this.difficulty <= 2) {
            return adjacentPairs >= 8;
        } else if (this.difficulty <= 3.5) {
            return adjacentPairs >= 4 && adjacentPairs <= 8;
        } else {
            return adjacentPairs <= 3;
        }
    }

    public shuffleUntilGood(maxAttempts: number = 50): { grid: number[][], attempts: number, success: boolean } {
        let attempts = 0;

        do {
            attempts++;
            this.shuffle();
        } while (!this.isEasyEnough() && attempts < maxAttempts);
        return {
            grid: this.grid,
            attempts,
            success: this.isEasyEnough()
        };
    }

    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    private getAllPositions(): Position[] {
        const positions: Position[] = [];
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                positions.push({ x, y });
            }
        }
        return positions;
    }
    public getMapLayer(grid: number[][]): Map<SubType, number[][]> {
        const RocketLayer: number[][] = Array.from({ length: this.gridHeight }, () => Array(this.gridWidth).fill(0));
        const BoomLayer: number[][] = Array.from({ length: this.gridHeight }, () => Array(this.gridWidth).fill(0));

        const bombCandidates: { x: number, y: number }[] = [];

        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (grid[y][x] == 8) {
                    RocketLayer[y][x] = 1;
                } else {
                    RocketLayer[y][x] = 0;
                    bombCandidates.push({ x, y });
                }
            }
        }

        const bombCount = this.data.Tiles.BombEffects
        for (let i = 0; i < bombCount; i++) {
            const index = Math.floor(Math.random() * bombCandidates.length);
            const { x, y } = bombCandidates.splice(index, 1)[0];
            BoomLayer[y][x] = 1;
        }
        console.log(BoomLayer)
        this.layerList.set(SubType.ROCKET, RocketLayer);
        this.layerList.set(SubType.BOOM, BoomLayer);
        return this.layerList;
    }

    public getGrid(): number[][] {
        return this.grid;
    }
}