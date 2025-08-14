import { _decorator, Component } from 'cc'
import { FillProgressBar } from './FillProgressBar'
const { ccclass, property } = _decorator

@ccclass('AnimationHandler')
export class AnimationHandler extends Component {
    public static fillProgressBar: FillProgressBar | null = null
    static animTile: Promise<void>[] = []
    static matchAnim: Promise<void>[] = []
    static animList: Promise<void>[] = []
    static setFillProgressBar(fillBar: FillProgressBar) {
        AnimationHandler.fillProgressBar = fillBar
    }
    static callProgress() {
        if (AnimationHandler.fillProgressBar) {
            AnimationHandler.fillProgressBar.updateProgressBar()
        }
    }
}
