import { _decorator, Component, instantiate, Node, Prefab } from 'cc'
import { TileConnect } from '../../type/type'
import GameManager from '../manager/GameManager'
import { Path } from '../path/Path'
import { InvalidPath } from '../path/InvalidPath'
const { ccclass, property } = _decorator

@ccclass('InvalidPool')
class InvalidPool extends Component implements TileConnect.IObjectPool<InvalidPath> {
    @property(Prefab)
    private pathPrefab: Prefab | null = null
    @property(Number)
    private size: number = 0
    private itemList: InvalidPath[] = []

    public initialize(game: GameManager) {
        for (let i = 0; i < this.size; i++) {
            const node = instantiate(this.pathPrefab) as Node | null
            if (node) {
                console.log('added child')
                game.node.addChild(node)
                node.setSiblingIndex(999998)
            }
            this.itemList.push(node?.getComponent(InvalidPath) as InvalidPath)
        }
        this.returnAll()
    }

    public getFirstItem(): InvalidPath | null {
        for (const tile of this.itemList)
            if (!tile.isUsed()) {
                tile.reSpawn()
                tile.node.setSiblingIndex(999998)
                return tile
            }
        return null
    }

    public returnPool(object: InvalidPath): void {
        object.kill()
    }
    public returnMultiple(objects: InvalidPath[]): void {
        for (const tile of objects) {
            tile.kill()
        }
    }
    public returnAll(): void {
        this.returnMultiple(this.itemList)
    }
}
export default InvalidPool
