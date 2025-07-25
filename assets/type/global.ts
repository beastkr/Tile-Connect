import { Vec2, Vec3, view } from 'cc'
import { Level } from '../components/level/Level'
import GameConfig from '../constants/GameConfig'

export enum SubType {
    BOOM = 'BOOM',
    GRAVITY = 'GRAVITY',
    ROCKET = 'ROCKET',
    BUTTERFLY = 'BUTTERFLY',
}
export enum Turn {
    LOAD,
    START,
    MATCH,
    END,
    PAUSE,
}

export enum TileType {
    NONE = -1,
    TYPE0 = 0,
    TYPE1 = 1,
    TYPE2 = 2,
    TYPE3 = 3,
    TYPE4 = 4,
    TYPE5 = 5,
    TYPE6 = 6,
    TYPE7 = 7,
    ROCKET = 8,
}

export enum Theme {
    NONE = '',
    CAKE = 'Img0_',
    FRUIT = 'Img1_',
    FISH = 'Img2_',
    CHAR = 'Img3_',
    VEHICLE = 'Img4_',
    ANIMAL = 'Img5_',
    FASHION = 'Img6_',
    SHELL = 'Img7_',
    BUTTERFLY = 'Img8_',
    DRINK = 'Img9_',
}

export function getTilePath(id: number, theme: Theme): string {
    if (id == TileType.ROCKET) return 'sprite/AllTiles/rocket/spriteFrame'
    return `sprite/AllTiles/${theme + String(id)}/spriteFrame`
}

export function getTilePosition(
    row: number,
    col: number,
    h: number,
    w: number,
    scale: number
): Vec2 {
    const halfWidth = (w * GameConfig.TileSize) / 2
    const halfHeight = (h * GameConfig.TileSize) / 2

    const x = col * GameConfig.TileSize + GameConfig.TileSize / 2 - halfWidth
    const y = -(row * GameConfig.TileSize + GameConfig.TileSize / 2 - halfHeight)

    return new Vec2(x, y)
}
export function getScale() {
    const visibleSize = view.getVisibleSize() // Size { width, height }
    const scaleX = visibleSize.width / 720
    const scaleY = visibleSize.width / 1280
    const scale = Math.max(scaleX, scaleY)
    return new Vec3(scale, scale)
}
export function getTilePositionByLevel(
    col: number, // x
    row: number, // y
    level: Level,
    padding: number = 0
): Vec2 {
    const tileSize = level.tileSize + 5
    const fullWidth = (level.gridWidth + padding * 2) * tileSize
    const fullHeight = (level.gridHeight + padding * 2) * tileSize

    const posX = col * tileSize + tileSize / 2 - fullWidth / 2
    const posY = -(row * tileSize + tileSize / 2 - fullHeight / 2)

    return new Vec2(posX, posY)
}

export const SUBTILE_PATH = 'Canvas/SubtilePool'
export const ROCKET_NODE_PATH = 'Canvas/SubtilePool/RocketPool'
export const GRAVITY_NODE_PATH = 'Canvas/SubtilePool/GravityPool'
