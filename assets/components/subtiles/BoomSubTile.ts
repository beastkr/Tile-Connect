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
    private time:number=0;
    public onAttach(tile: Tile): void {
        super.onAttach(tile)
        tile.node.addChild(this.node)
        this.coundown!.node.active=true
        this.boom!.node.active=true
        console.log(this.tile!.node.position)
        console.log(this.node.position)     
    }
    
    

}
