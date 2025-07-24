import { _decorator, Component, instantiate, Node, Prefab } from 'cc'
import { TileConnect } from '../../type/type'
import GameManager from '../manager/GameManager'
import Tile from '../tiles/Tile'
const { ccclass, property } = _decorator

@ccclass('TilePool')
class TilePool extends Component implements TileConnect.IObjectPool<Tile> {
    @property(Prefab)
    private tilePrefab: Prefab | null = null
    @property(Number)
    private size: number = 0
    private itemList: Tile[] = []

    public initialize(game: GameManager) {
        for (let i = 0; i < this.size; i++) {
            const node = instantiate(this.tilePrefab) as Node | null
            if (node) {
                console.log('added child')
                game.node.addChild(node)
            }
            this.itemList.push(node?.getComponent(Tile) as Tile)
        }
        this.returnAll()
    }

    public getFirstItem(): Tile | null {
        for (const tile of this.itemList)
            if (!tile.isUsed()) {
                tile.reSpawn()
                return tile
            }
        return null
    }

    public returnPool(object: Tile): void {
        object.kill()
    }
    public returnMultiple(objects: Tile[]): void {
        for (const tile of objects) {
            tile.kill()
        }
    }
    public returnAll(): void {
        this.returnMultiple(this.itemList)
    }
}
export default TilePool
