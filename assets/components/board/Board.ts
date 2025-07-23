import { _decorator, Component, Vec2 } from 'cc'
import { TileConnect } from '../../type/type'
const { ccclass, property } = _decorator

@ccclass('Board')
class Board extends Component implements TileConnect.IBoard {
    private board: TileConnect.ITile[][] = []

    public match(tile1: TileConnect.ITile, tile2: TileConnect.ITile): void {}
    public canMatch(tile1: TileConnect.ITile, tile2: TileConnect.ITile): boolean {
        return true
    }
    public getPath(
        tile1: TileConnect.ITile,
        tile2: TileConnect.ITile
    ): { path: Vec2[]; turnNum: number } {
        return { path: [], turnNum: 0 }
    }
    public setUpManager(game: TileConnect.IGameManager): void {
        for (const row of this.board) {
            for (const tile of row)
                tile.addOnClickCallback((tile: TileConnect.ITile) => game.choose(tile))
        }
    }
}

export default Board
