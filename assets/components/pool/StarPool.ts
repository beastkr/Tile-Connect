import { _decorator, Component, instantiate, Node, Prefab } from 'cc'
import { TileConnect } from '../../type/type'
import GameManager from '../manager/GameManager'
import { Star } from '../star/Star'
const { ccclass, property } = _decorator

@ccclass('StarPool')
class StarPool extends Component implements TileConnect.IObjectPool<Star> {
    @property(Prefab)
    private pathPrefab: Prefab | null = null
    @property(Number)
    private size: number = 0
    private itemList: Star[] = []

    public initialize(game: GameManager) {
        for (let i = 0; i < this.size; i++) {
            const node = instantiate(this.pathPrefab) as Node | null
            if (node) {
                console.log('added child')
                game.node.addChild(node)
                node.setSiblingIndex(999999)
            }
            this.itemList.push(node?.getComponent(Star) as Star)
        }
        this.returnAll()
    }

    public getFirstItem(): Star | null {
        for (const tile of this.itemList)
            if (!tile.isUsed()) {
                tile.reSpawn()
                tile.node.setSiblingIndex(999999)

                return tile
            }
        return null
    }

    public returnPool(object: Star): void {
        object.kill()
    }
    public returnMultiple(objects: Star[]): void {
        for (const tile of objects) {
            tile.kill()
        }
    }
    public returnAll(): void {
        this.returnMultiple(this.itemList)
    }
}
export default StarPool
