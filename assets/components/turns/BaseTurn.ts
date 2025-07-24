import { TileConnect } from '../../type/type'
import GameManager from '../manager/GameManager'

export class BaseTurn implements TileConnect.ITurn {
    protected game: GameManager
    constructor(game: GameManager) {
        this.game = game
    }
    onEnter(): void {}
    onExit(): void {}
    onUpdate(): void {}
}
