import { _decorator, Component, Node } from 'cc'
const { ccclass, property } = _decorator

@ccclass('BreakTile')
export class BreakTile extends Component {
    @property(Node)
    private top: Node | null = null
    @property(Node)
    private bot: Node | null = null
    @property(Node)
    private right: Node | null = null
    @property(Node)
    private left: Node | null = null
    start() {}

    update(deltaTime: number) {}
}
