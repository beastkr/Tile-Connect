import { Theme } from '../../type/global'

export class Level {
    theme: Theme = Theme.CAKE
    public gridHeight: number = 0
    public gridWidth: number = 0
    public grid: number[][] = []
    constructor(h: number, w: number, grid: number[][], theme: Theme) {
        this.theme = theme
        this.gridHeight = h
        this.gridWidth = w
        this.grid = grid
    }
}
