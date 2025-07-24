import { _decorator, Component, resources, Sprite, SpriteFrame, Vec2, Vec3 } from 'cc'
import { getTilePath, getTilePosition, SubType, Theme, TileType } from '../../type/global'
import { TileConnect } from '../../type/type'
import { Level } from '../level/Level'
const { ccclass, property } = _decorator

@ccclass('Tile')
class Tile extends Component implements TileConnect.ITile, TileConnect.IPoolObject {
    @property(Sprite)
    private itemTypeSprite: Sprite | null = null
    @property(Sprite)
    private backGroundSpite: Sprite | null = null

    private used: boolean = false
    private theme: Theme = Theme.NONE
    private coordinate: Vec2 = new Vec2()
    private typeID: TileType = TileType.NONE

    private subTileList: Map<SubType, TileConnect.ISubTile> = new Map<
        SubType,
        TileConnect.ISubTile
    >()

    protected start(): void {
        // this.setTheme(Theme.FRUIT)
        // this.setTypeID(0)
    }

    public onClickCallbacks: ((tile: TileConnect.ITile) => void)[] = []

    public setTheme(theme: Theme) {
        if (theme == this.theme) return
        this.theme = theme
        const PATH = getTilePath(this.typeID, this.theme)
        // console.log(PATH)
        const spriteFrame = resources.get(PATH, SpriteFrame)
        // console.log(spriteFrame)
        if (this.itemTypeSprite) this.itemTypeSprite.spriteFrame = spriteFrame
    }

    public getTheme(): Theme {
        return this.theme
    }
    public addOnClickCallback(callback: (tile: TileConnect.ITile) => void): void {
        this.onClickCallbacks.push(callback)
    }

    public emitOnClickCallbacks(): void {
        this.onClickCallbacks.forEach((callback) => {
            callback(this)
        })
    }

    public clearOnClickCallbacks(): void {
        this.onClickCallbacks = []
    }

    public getCoordinate(): Vec2 {
        return this.coordinate
    }

    public setCoordinate(newCoordinate: Vec2): void {
        this.coordinate = newCoordinate
    }

    public getTypeID(): number {
        return this.typeID
    }

    public isUsed(): boolean {
        return this.used
    }
    public reSpawn(): void {
        this.used = true
        this.node.active = true
    }
    public hide() {
        this.setTypeID(TileType.NONE)
        this.node.active = false
    }
    public kill(): void {
        this.setTypeID(TileType.NONE)
        this.used = false
        this.node.active = false
    }
    public setTypeID(id: TileType): void {
        if (id == this.typeID) return
        this.typeID = id
        const PATH = getTilePath(this.typeID, this.theme)
        // console.log(PATH)
        const spriteFrame = resources.get(PATH, SpriteFrame)
        // console.log(spriteFrame)
        if (this.itemTypeSprite) this.itemTypeSprite.spriteFrame = spriteFrame
    }

    public attachSubType(subTile: TileConnect.ISubTile, key: SubType): void {
        this.subTileList.set(key, subTile)
    }

    public detachSubType(key: SubType): void {
        this.subTileList.delete(key)
    }

    public onDead(): void {
        this.subTileList.forEach((subTile) => {
            subTile.onDead()
        })
    }
    public moveToRealPosition(level: Level): void {
        const pos = getTilePosition(
            this.coordinate.x,
            this.coordinate.y,
            level.gridHeight,
            level.gridWidth
        )
        this.node.setPosition(new Vec3(pos.x, pos.y))
        // console.log('moved to: ', pos)
    }
    public moveToRealPositionWithPadding(level: Level): void {
        const PADDING = 1
        const pos = getTilePosition(
            this.coordinate.y - PADDING,
            this.coordinate.x - PADDING,
            level.gridHeight,
            level.gridWidth
        )
        this.node.setPosition(new Vec3(pos.x, pos.y))
    }
}

export default Tile
