import {
    _decorator,
    Component,
    Node,
    resources,
    Size,
    Sprite,
    SpriteFrame,
    tween,
    UITransform,
    Vec2,
    Vec3,
} from 'cc'
import { getTilePath, getTilePositionByLevel, SubType, Theme, TileType } from '../../type/global'
import { TileConnect } from '../../type/type'
import Board from '../board/Board'
import { Level } from '../level/Level'
const { ccclass, property } = _decorator

@ccclass('Tile')
class Tile extends Component implements TileConnect.ITile, TileConnect.IPoolObject {
    @property(Sprite)
    private itemTypeSprite: Sprite | null = null
    @property(Sprite)
    private backGroundSpite: Sprite | null = null
    @property(Node)
    public wholeSprite: Node | null = null

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

    public setCoordinate(coord: Vec2): void {
        this.coordinate = new Vec2(coord.x, coord.y) // đảm bảo không trỏ nhầm reference cũ
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
        for (const sub of this.subTileList) {
            this.detachSubType(sub[0])
        }
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
        subTile.onAttach(this)
    }

    public detachSubType(key: SubType): void {
        this.subTileList.delete(key)
    }

    public onDead(board: Board, isMain: boolean, other: Tile): void {
        for (const sub of this.subTileList) {
            const otherSub = other.subTileList.get(sub[0])
            sub[1].onDead(board, isMain, otherSub!)
        }
    }
    public moveToRealPosition(level: Level): void {
        const pos = getTilePositionByLevel(this.coordinate.x, this.coordinate.y, level)
        this.node.setPosition(new Vec3(pos.x, pos.y))
        // console.log('moved to: ', pos)
    }

    public moveToRealPositionWithPadding(level: Level): void {
        const PADDING = 1
        const pos = getTilePositionByLevel(
            this.coordinate.x - PADDING,
            this.coordinate.y - PADDING,
            level
        )
        const targetPos = new Vec3(pos.x, pos.y, 0)

        // Optional: bạn có thể stop tween cũ trước khi tạo tween mới nếu cần
        tween(this.node).to(0.2, { position: targetPos }, { easing: 'quadOut' }).start()
    }
    public reScale(scale: number) {
        this.wholeSprite?.setScale(new Vec3(scale, scale))
        this.node.getComponent(UITransform)?.setContentSize(new Size(scale * 80, scale * 80))
    }
    public onChoose() {
        this.wholeSprite?.setScale(this.wholeSprite.scale.multiplyScalar(1.2))
    }
    public onUnchoose() {
        this.wholeSprite?.setScale(this.wholeSprite?.scale.multiplyScalar(1 / 1.2))
    }
}

export default Tile
