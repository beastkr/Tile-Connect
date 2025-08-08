import { _decorator } from 'cc'
import Board from '../board/Board'
import Tile from '../tiles/Tile'
import { BaseSubTile } from './BaseSubTile'
const { ccclass, property } = _decorator

@ccclass('ButterflySubtile')
export class ButterflySubtile extends BaseSubTile {
    public onAttach(tile: Tile): void {
        super.onAttach(tile)
    }
    public onDead(board: Board, isMain: boolean, other: BaseSubTile): void {}
    public onDetach(): void {
        super.onDetach()
    }
}
