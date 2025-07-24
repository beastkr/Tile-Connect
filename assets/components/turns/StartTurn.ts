import { BaseTurn } from './BaseTurn'

export class StartTurn extends BaseTurn {
    public onEnter(): void {
        this.game.unChoose()
        this.turnOnInput()
    }

    onExit(): void {
        this.turnOffInput()
    }

    private turnOnInput() {
        this.game.board?.setUpManager(this.game)
    }
    private turnOffInput() {
        this.game.board?.resetInput()
    }
}
