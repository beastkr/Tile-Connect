import { _decorator, Component, director, Label } from 'cc'
import { Turn } from '../../type/global'
import GameManager from '../manager/GameManager'
import { TileConnect } from '../../type/type'
import { LevelLoader } from '../level/LevelLoader'
const { ccclass, property } = _decorator

@ccclass('Timer')
export class Timer extends Component {
    @property(GameManager)
    gm: GameManager | null = null
    private hasTriggeredTimeUp: boolean = false
    isrun: boolean = false

    start() {
        this.resetTimer()
        this.hasTriggeredTimeUp = false
        director.on(TileConnect.GAME_EVENTS.START_COUNTDOWN, this.startCountdown, this)
        director.on(TileConnect.GAME_EVENTS.COUNTDOWN_RESET, this.resetTimer, this)
    }

    public resetTimer() {
        this.isrun = false
        this.hasTriggeredTimeUp = false
        const s = this.node.getComponent(Label)
        if (this.gm && s) {
            s.string = this.convertTime(this.gm.time)
        }
    }

    public convertTime(time: number): string {
        const minutes = Math.floor(time / 60)
        const seconds = time % 60
        const formattedSeconds = seconds.toString().padStart(2, '0')
        return `${minutes}:${formattedSeconds}`
    }

    public startCountdown() {
        this.isrun = true
        const s = this.node.getComponent(Label)
        console.log(this.gm?.time)
        if (this.gm && s) {
            s.string = this.convertTime(this.gm.time)
        }
    }

    update(deltaTime: number) {
        if (!this.gm || this.gm.ispause || !this.isrun) return

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
            this.isrun = false
            this.hasTriggeredTimeUp = true
            if (!this.gm.isWin()) this.gm.switchTurn(Turn.FAIL)
            if (s) {
                s.string = this.convertTime(0)
            }
        }
    }

    public isWin() {
        if (this.gm?.isWin() && this.gm.time > 0) {
        }
    }

    onDestroy() {
        director.off(TileConnect.GAME_EVENTS.START_COUNTDOWN, this.startCountdown, this)
        director.off(TileConnect.GAME_EVENTS.COUNTDOWN_RESET, this.resetTimer, this)
    }
}
