import { _decorator } from 'cc'
import { TileType } from '../../type/global'
import Board from '../board/Board'
import Tile from '../tiles/Tile'
import { BaseSubTile } from './BaseSubTile'
const { ccclass, property } = _decorator

@ccclass('RocketSubTile')
export class RocketSubTile extends BaseSubTile {
    public onAttach(tile: Tile): void {
        super.onAttach(tile)
        tile.setTypeID(TileType.ROCKET)
        console.log('nnnn')
    }
    public onDead(board: Board, isMain: boolean): void {
        if (!isMain) return
        const tileMap = new Map<TileType, Tile[]>()

        // Gom tất cả tile có type hợp lệ
        for (const row of board.board) {
            for (const tile of row) {
                const type = tile.getTypeID()
                if (type === TileType.NONE || type === TileType.ROCKET) continue

                if (!tileMap.has(type)) {
                    tileMap.set(type, [])
                }
                tileMap.get(type)!.push(tile as Tile)
            }
        }

        // Lọc ra những type có ít nhất 2 tile
        const validTypes = Array.from(tileMap.entries()).filter(([_, tiles]) => tiles.length >= 2)

        if (validTypes.length === 0) return

        // Chọn ngẫu nhiên một loại
        const [randomType, tiles] = validTypes[Math.floor(Math.random() * validTypes.length)]

        // Chọn ngẫu nhiên 2 tile trong số đó
        const shuffled = tiles.sort(() => Math.random() - 0.5)
        const selected = shuffled.slice(0, 2)

        console.log('explode random 2 tiles of type:', randomType)

        if (selected) {
            selected[0].onDead(board, isMain, selected[1])
            selected[1].onDead(board, isMain, selected[0])
            selected[0].kill()
            selected[1].kill()
        }
    }
}
