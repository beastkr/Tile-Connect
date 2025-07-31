import { _decorator, Component, Label, Node } from 'cc'
import GameManager from '../manager/GameManager'
import { Turn } from '../../type/global'
const { ccclass, property } = _decorator

@ccclass('Timer')
export class Timer extends Component {
    @property(GameManager)
    gm: GameManager | null = null
    private hasTriggeredTimeUp: boolean = false

    start() {
        const s = this.node.getComponent(Label)
        if (this.gm && s) {
            s.string = this.convertTime(this.gm.time)
        }
        this.hasTriggeredTimeUp = false
    }

    public convertTime(time: number): string {
        const minutes = Math.floor(time / 60)
        const seconds = time % 60
        const formattedSeconds = seconds.toString().padStart(2, '0')
        return `${minutes}:${formattedSeconds}`
    }

    update(deltaTime: number) {
        if (!this.gm || this.gm.ispause) return

        const s = this.node.getComponent(Label)
        if (this.gm.time > 0 && this.hasTriggeredTimeUp) {
            this.hasTriggeredTimeUp = false
        }
        if (this.gm.time > 0) {
            this.gm.time -= deltaTime

            if (this.gm.time < 0) {
                this.gm.time = 0
            }

            if (s) {
                s.string = this.convertTime(Math.ceil(this.gm.time))
            }
        }
        if (this.gm.time <= 0 && !this.hasTriggeredTimeUp) {
            console.log('Time up!')
            this.hasTriggeredTimeUp = true
            this.gm.switchTurn(Turn.FAIL)
            if (s) {
                s.string = this.convertTime(0)
            }
        }
    }
}
