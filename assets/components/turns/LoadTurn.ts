import { Theme, Turn } from '../../type/global'
import { Level } from '../level/Level'
import { BaseTurn } from './BaseTurn'
const mockUpLevel = new Level(
    6,
    5,
    [
        [1, 2, 3, 4, 5],
        [1, 2, 3, 4, 3],
        [1, 2, 5, 4, 3],
        [1, 2, 3, 4, 5],
        [1, 2, 3, 4, 5],
        [1, 2, 3, 4, 3],
    ],
    Theme.CAKE
)
export class LoadTurn extends BaseTurn {
    public onEnter(): void {
        // this.game.node.setScale(getScale())
        this.game.createBoard(mockUpLevel)
        this.game.switchTurn(Turn.START)
    }

    onExit(): void {}
}
