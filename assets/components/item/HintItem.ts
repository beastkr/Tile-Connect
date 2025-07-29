import { _decorator, Vec2 } from 'cc'
import { TileType } from '../../type/global'
import Board from '../board/Board'
import PathPool from '../pool/PathPool'
import StarPool from '../pool/StarPool'
import Tile from '../tiles/Tile'
import BaseItem from './BaseItem'

const { ccclass, property } = _decorator

@ccclass('HintItem')
class HintItem extends BaseItem {
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
        this.game?.unChoose()
        const board = this.game?.board as Board
        const path = this.game?.board?.getPath(tile1, tile2)
        this.game?.hintTile.push(tile1, tile2)
        tile1.onHint()
        tile2.onHint()
        this.drawPath(path!.path, this.game!.pathPool!)
        this.putStar(path!.path, this.game!.starPool!)
    }
    public drawPath(path: Vec2[], pool: PathPool) {
        for (let i = 0; i < path.length - 1; i++) {
            const from = path[i]
            const posFrom = (this.game!.board?.board[from.y][from.x] as Tile).node
                .getPosition()
                .toVec2()

            const to = path[i + 1]
            const posTo = (this.game!.board?.board[to.y][to.x] as Tile).node.getPosition().toVec2()
            const p = pool.getFirstItem()
            console.log('from: ', posFrom, 'to: ', posTo)
            p?.createPath(posFrom, posTo, false)
            this.game!.hintPath.push(p!)

            console.log('draw path from', from, 'to', to)
        }
    }
    public putStar(path: Vec2[], pool: StarPool) {
        for (let i = 0; i < path.length; i++) {
            const from = path[i]
            const pos = (this.game?.board?.board[from.y][from.x] as Tile).node.getPosition().clone()
            const star = pool.getFirstItem()
            star?.putAtForHint(pos)
            this.game?.hintPoint.push(star!)
        }
    }
}
export default HintItem
