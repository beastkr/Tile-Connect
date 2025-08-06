import { _decorator, Component, instantiate, Node, Prefab, tween, Vec3 } from 'cc'
import { getTilePositionByLevel } from '../../type/global'
import { TileConnect } from '../../type/type'
import { Level } from '../level/Level'
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
    shaking: boolean = false

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

    shake(power: number, level: Level) {
        if (this.shaking) return
        this.shaking = true
        for (const tile of this.itemList) {
            if (!tile.isUsed()) continue
            const pos = getTilePositionByLevel(
                tile.getCoordinate().x,
                tile.getCoordinate().y,
                level,
                1
            ).toVec3()

            tween(tile.node)
                .to(0.05, { position: pos.clone().add(new Vec3(power, power)) })
                .to(0.05, { position: pos.clone().subtract(new Vec3(power, power)) })
                .to(0.05, { position: pos })
                .call(() => (this.shaking = false))
                .start()
        }
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
        object.node.setPosition(new Vec3())
    }
    public returnMultiple(objects: Tile[]): void {
        for (const tile of objects) {
            tile.kill()
            tile.detachAll()
        }
    }
    public returnAll(): void {
        this.returnMultiple(this.itemList)
    }
}
export default TilePool
