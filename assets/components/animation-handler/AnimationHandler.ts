import { _decorator, Component } from 'cc'
const { ccclass, property } = _decorator

@ccclass('AnimationHandler')
export class AnimationHandler extends Component {
    static animList: Promise<void>[] = []
    static animTile: Promise<void>[] = []
}
