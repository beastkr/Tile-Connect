import { Vec2, Vec3, view } from 'cc'
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
    return `sprite/AllTiles/${theme + String(id)}/spriteFrame`
}

export function getTilePosition(row: number, col: number, h: number, w: number): Vec2 {
    const halfWidth = (w * GameConfig.TileSize) / 2
    const halfHeight = (h * GameConfig.TileSize) / 2

    const x = col * GameConfig.TileSize + GameConfig.TileSize / 2 - halfWidth
    const y = -(row * GameConfig.TileSize + GameConfig.TileSize / 2 - halfHeight)

    return new Vec2(x, y)
}
export function getScale() {
    const visibleSize = view.getVisibleSize() // Size { width, height }
    const scaleX = Math.max(1, visibleSize.width / 720)
    const scaleY = Math.max(1, visibleSize.width / 1280)
    const scale = Math.min(scaleX, scaleY)
    return new Vec3(scale, scale)
}
