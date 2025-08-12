import { _decorator, Component } from 'cc'
import { TileConnect } from '../../type/type'
import Board from '../board/Board'
import Tile from '../tiles/Tile'
const { ccclass, property } = _decorator

@ccclass('BaseSubTile')
export class BaseSubTile
    extends Component
    implements TileConnect.ISubTile, TileConnect.IPoolObject {
    private used: boolean = false
    public tile: Tile | null = null
    public onDead(board: Board, isMain: boolean, other: BaseSubTile, killByRocket: boolean = false): void { }
    public onResolve(): void { }
    public onAttach(tile: Tile): void {
        this.tile = tile
    }
    public onDetach(): void {
        this.tile = null
    }
    isUsed(): boolean {
        return this.used
    }
    public reSpawn(): void {
        this.used = true
        // this.node.active = true
    }
    public kill(): void {
        this.used = false
        // this.node.active = false
    }
}
