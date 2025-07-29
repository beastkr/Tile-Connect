import { BaseTurn } from './BaseTurn'

export class FailTurn extends BaseTurn {
    onEnter(): void {
        this.game.turnOffInput()
        this.game.unChoose()
        this.game.gameOver()
        console.log('Fail')
    }

    onExit(): void {}
    onUpdate(): void {}
}
