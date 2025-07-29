import { SubType, Theme } from '../../type/global'

export class Level {
    theme: Theme = Theme.CAKE
    public gridHeight: number = 0
    public gridWidth: number = 0
    public grid: number[][] = []
    public time: number
    public tileSize: number = 0
    public scale: number = 0
    public layer: Map<SubType, number[][]> = new Map<SubType, number[][]>()
    constructor(
        h: number,
        w: number,
        grid: number[][],
        theme: Theme,
        time: number,
        layer?: Map<SubType, number[][]>
    ) {
        this.theme = theme
        this.gridHeight = h
        this.gridWidth = w
        this.grid = grid
        this.tileSize = Math.min(560 / this.gridWidth, 800 / this.gridHeight)
        this.scale = Math.min(7 / this.gridWidth, 10 / this.gridHeight)
        if (layer) this.layer = layer
        this.time = time
    }
    public change(
        h: number,
        w: number,
        grid: number[][],
        theme: Theme,
        time: number,
        layer?: Map<SubType, number[][]>
    ) {
        this.theme = theme
        this.gridHeight = h
        this.gridWidth = w
        this.grid = grid
        this.tileSize = Math.min(560 / this.gridWidth, 800 / this.gridHeight)
        this.scale = Math.min(7 / this.gridWidth, 10 / this.gridHeight)
        if (layer) this.layer = layer
        this.time = time
    }
    public getTime() {
        return this.time
    }
}
