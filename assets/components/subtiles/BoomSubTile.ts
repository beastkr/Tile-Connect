import { TileType } from './../../type/global';
import { _decorator, Sprite, Tween, tween, Vec3 } from 'cc'
import Board from '../board/Board'
import GameManager from '../manager/GameManager'
import Tile from '../tiles/Tile'
import { BaseSubTile } from './BaseSubTile'
const { ccclass, property } = _decorator

@ccclass('BoomSubTile')
export class BoomSubTile extends BaseSubTile {
    private timer:number=30;
    @property(Sprite)
    coundown: Sprite | null = null
    @property(Sprite)
    boom: Sprite | null = null
    public onAttach(tile: Tile): void {
        super.onAttach(tile)
        tile.node.addChild(this.node)
        this.coundown!.node.active=true
        this.boom!.node.active=true     
    }
    public onDead(board: Board, isMain: boolean, other: BaseSubTile): void {
       this.tile?.node.removeChild(this.node)
       this.coundown!.node.active=false
       this.boom!.node.active=false
    }
    
    

}
