import { _decorator, Component, resources, Sprite, SpriteFrame, Vec2 } from 'cc'
import { getTilePath, SubType, Theme } from '../../type/global'
import { TileConnect } from '../../type/type'
const { ccclass, property } = _decorator

@ccclass('Tile')
class Tile extends Component implements TileConnect.ITile {
    @property(Sprite)
    private itemTypeSprite: Sprite | null = null
    @property(Sprite)
    private backGroundSpite: Sprite | null = null

    private theme: Theme = Theme.NONE
    private coordinate: Vec2 = new Vec2()
    private typeID: number = 0

    private subTileList: Map<SubType, TileConnect.ISubTile> = new Map<
        SubType,
        TileConnect.ISubTile
    >()

    protected start(): void {
        this.setTheme(Theme.FRUIT)
        this.setTypeID(0)
    }

    public onClickCallbacks: ((tile: TileConnect.ITile) => void)[] = []

    public setTheme(theme: Theme) {
        if (theme == this.theme) return
        this.theme = theme
        const PATH = getTilePath(this.typeID, this.theme)
        console.log(PATH)
        const spriteFrame = resources.get(PATH, SpriteFrame)
        console.log(spriteFrame)
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

    public setTypeID(id: number): void {
        if (id == this.typeID) return
        this.typeID = id
        const PATH = getTilePath(this.typeID, this.theme)
        console.log(PATH)
        const spriteFrame = resources.get(PATH, SpriteFrame)
        console.log(spriteFrame)
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
}

export default Tile
