import { _decorator, Component, instantiate, Node, Prefab } from 'cc'
import { TileConnect } from '../../type/type'
import GameManager from '../manager/GameManager'
import { Star } from '../star/Star'
import { Nope } from '../star/Nope'
const { ccclass, property } = _decorator

@ccclass('NopePool')
class NopePool extends Component implements TileConnect.IObjectPool<Nope> {
    @property(Prefab)
    private pathPrefab: Prefab | null = null
    @property(Number)
    private size: number = 0
    private itemList: Nope[] = []

    public initialize(game: GameManager) {
        for (let i = 0; i < this.size; i++) {
            const node = instantiate(this.pathPrefab) as Node | null
            if (node) {
                console.log('added child')
                game.node.addChild(node)
                node.setSiblingIndex(999999)
            }
            this.itemList.push(node?.getComponent(Nope) as Nope)
        }
        this.returnAll()
    }

    public getFirstItem(): Nope | null {
        for (const tile of this.itemList)
            if (!tile.isUsed()) {
                tile.reSpawn()
                tile.node.setSiblingIndex(999999)

                return tile
            }
        return null
    }

    public returnPool(object: Nope): void {
        object.kill()
    }
    public returnMultiple(objects: Nope[]): void {
        for (const tile of objects) {
            tile.kill()
        }
    }
    public returnAll(): void {
        this.returnMultiple(this.itemList)
    }
}
export default NopePool
