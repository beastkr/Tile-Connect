import { _decorator } from 'cc'
import { TileType } from '../../type/global'
import Board from '../board/Board'
import Tile from '../tiles/Tile'
import { BaseItem } from './BaseItem'

const { ccclass, property } = _decorator

@ccclass('HintItem')
export class HintItem extends BaseItem {
    onUse(): void {
        if (this.clicked) return
        super.onUse()
        if (this.quantity == 0) return
        const board = this.game?.board?.board
        if (!board) return

        let found = false

        outer: for (let y1 = 0; y1 < board.length; y1++) {
            for (let x1 = 0; x1 < board[0].length; x1++) {
                const tile1 = board[y1][x1] as Tile
                if (!tile1 || tile1.getTypeID() == TileType.NONE) continue

                for (let y2 = y1; y2 < board.length; y2++) {
                    const xStart = y1 === y2 ? x1 + 1 : 0
                    for (let x2 = xStart; x2 < board[0].length; x2++) {
                        const tile2 = board[y2][x2] as Tile
                        if (!tile2 || tile2.getTypeID() == TileType.NONE) continue

                        if (tile1 !== tile2 && this.game?.board?.canMatch(tile1, tile2)) {
                            this.showHintEffect(tile1, tile2)
                            found = true
                            break outer
                        }
                    }
                }
            }
        }

        if (found) {
            this.quantity--
            this.textChange()
        }
    }

    private showHintEffect(tile1: Tile, tile2: Tile) {
        const board = this.game?.board as Board
        const path = this.game?.board?.getPath(tile1, tile2)
        board.drawPath(path!.path, this.game!.pathPool!)
    }
}
