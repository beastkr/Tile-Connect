import { _decorator, Component, instantiate, Node, Prefab } from 'cc'
import { TileConnect } from '../../type/type'
import GameManager from '../manager/GameManager'
import { BaseSubTile } from './BaseSubTile'
const { ccclass, property } = _decorator

@ccclass('SubTilePool')
class SubTilePool extends Component implements TileConnect.IObjectPool<BaseSubTile> {
    @property(Prefab)
    private subTilePrefab: Prefab | null = null
    private size: number = 70
    private itemList: BaseSubTile[] = []
    public constructor(game: GameManager) {
        super()
    }

    public initialize(game: GameManager) {
        for (let i = 0; i < this.size; i++) {
            const node = instantiate(this.subTilePrefab) as Node | null
            if (node) {
                console.log('added child')
                game.node.addChild(node)
            }
            this.itemList.push(node?.getComponent(BaseSubTile) as BaseSubTile)
        }
        this.returnAll()
    }

    public getFirstItem(): BaseSubTile | null {
        for (const tile of this.itemList)
            if (!tile.isUsed()) {
                tile.reSpawn()
                return tile
            }
        return null
    }

    public returnPool(object: BaseSubTile): void {
        object.kill()
    }
    public returnMultiple(objects: BaseSubTile[]): void {
        for (const tile of objects) {
            tile.kill()
        }
    }
    public returnAll(): void {
        this.returnMultiple(this.itemList)
    }
}
export default SubTilePool
