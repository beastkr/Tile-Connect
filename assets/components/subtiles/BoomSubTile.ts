import { _decorator, Sprite } from 'cc'
import Board from '../board/Board'
import Tile from '../tiles/Tile'
import { BaseSubTile } from './BaseSubTile'
import { Countdown } from './Countdown'
const { ccclass, property } = _decorator

@ccclass('BoomSubTile')
export class BoomSubTile extends BaseSubTile {
    private timer: number = 40
    @property(Sprite)
    coundown: Sprite | null = null
    @property(Sprite)
    boom: Sprite | null = null
    @property(Countdown)
    cd: Countdown | null = null

    public onAttach(tile: Tile): void {
        super.onAttach(tile)
        tile.wholeSprite?.addChild(this.node)
        this.coundown!.node.active = true
        this.boom!.node.active = true
    }
    public onDead(board: Board, isMain: boolean, other: BaseSubTile): void {
        this.cd?.resetCountdown()
        this.tile?.wholeSprite?.removeChild(this.node)
        this.coundown!.node.active = false
        this.boom!.node.active = false
    }
    public onDetach(): void {
        this.cd?.resetCountdown()
        this.tile?.wholeSprite?.removeChild(this.node)
        this.coundown!.node.active = false
        this.boom!.node.active = false
        super.onDetach()
    }
}
