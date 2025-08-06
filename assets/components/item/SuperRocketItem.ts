import {
    _decorator,
    Animation,
    Node,
    ParticleSystem2D,
    resources,
    Sprite,
    SpriteFrame,
    tween,
    Vec3,
    view,
} from 'cc'
import { FIREWORK_PATH, Item, ROCKET_PATH, TileType, Turn } from '../../type/global'
import Board from '../board/Board'
import Tile from '../tiles/Tile'
import BaseItem from './BaseItem'

const { ccclass, property } = _decorator

@ccclass('SuperRocketItem')
class SuperRocketItem extends BaseItem {
    @property(Node)
    overlay: Node | null = null
    @property(Node)
    rockets: Node[] = []
    onUse(): void {
        if (this.clicked || this.quantity == 0 || this.locked) return
        super.onUse()

        const exclude = new Set<Tile>()

        const pair1 = this.getRandomMatchingPair(exclude)
        if (!pair1) return
        pair1.forEach((tile) => exclude.add(tile))

        const pair2 = this.getRandomMatchingPair(exclude)
        if (!pair2) return
        pair2.forEach((tile) => exclude.add(tile))

        const pair3 = this.getRandomMatchingPair(exclude)
        if (!pair3) return

        const tileList: Tile[] = [...pair1, ...pair2, ...pair3]

        this.game?.node.addChild(this.overlay!)
        this.overlay!.active = true
        this.overlay!.setPosition(new Vec3())
        console.log(this.itemManager!.botOverlay)
        if (view.getVisibleSize().width < view.getVisibleSize().height)
            this.itemManager!.botOverlay!.active = true
        this.itemManager!.botOverlay!.setSiblingIndex(this.node.getSiblingIndex() - 1)
        this.game?.unChoose()
        this.game?.turnOffInput()

        for (const row of this.game?.board?.board!) {
            for (const tile of row) {
                ;(tile as Tile).node.setSiblingIndex(1)
            }
        }

        for (const tile of tileList) {
            tile.node.setSiblingIndex(this.overlay!.getSiblingIndex() + 1)
        }
        this.itemManager?.hideExcept(Item.SUPERROCKET)
        this.showRocket(tileList)
        console.log('rocket')
        this.quantity--
        this.textChange()
    }

    showRocket(tileList: Tile[]) {
        this.stopFunction()
        const segment = view.getVisibleSize().width / 7
        const screenSize = view.getVisibleSize()
        const fireWork = resources.get(FIREWORK_PATH, SpriteFrame)
        const rocketFrame = resources.get(ROCKET_PATH, SpriteFrame)

        for (let i = 0; i < tileList.length; i++) {
            this.rockets[i].active = true
            const rocketSprite = this.rockets[i].getChildByName('Rocket1')
            const explo = this.rockets[i]!.getChildByName('Explosion')?.getComponent(Animation)
            const bro = this.rockets[i]!.getChildByName('break')?.getComponent(Animation)
            console.log(explo)

            this.rockets[i].angle = 0
            rocketSprite!.getComponent(Sprite)!.spriteFrame = fireWork
            const dust = this.rockets[i]
                .getChildByName('RocketDust')
                ?.getComponent(ParticleSystem2D)

            this.rockets[i].setWorldPosition(new Vec3(segment * (i + 1), -100))
            dust?.resetSystem()
            rocketSprite!.active = true
            const side = i >= 3 ? view.getVisibleSize().width + 200 : -200
            const angle = this.getAngleBetween(this.rockets[i].worldPosition, new Vec3(side, 500))
            tileList[i].underKill = true
            this.rockets[i].setScale(0.8, 0.8)
            tween(this.rockets[i])
                .to(0.5, { worldPosition: new Vec3(segment * (i + 1), 50) })
                .delay(0.2)
                .to(0.1 + 0.1 * i, { angle: angle - 25 })
                .to(0.5, { worldPosition: new Vec3(side, screenSize.height / 2) })
                .delay(0.5)
                .call(() => {
                    this.rockets[i].setScale(1.2, 1.2)
                    rocketSprite!.getComponent(Sprite)!.spriteFrame = rocketFrame
                    this.rockets[i].angle = this.getAngleBetween(
                        this.rockets[i].worldPosition,
                        tileList[i].node.worldPosition
                    )
                    tween(this.rockets[i])
                        .to(
                            0.3 + i * 0.1,
                            { worldPosition: tileList[i].node.worldPosition },
                            { easing: 'sineOut' }
                        )

                        .call(() => {
                            tileList[i].node.setSiblingIndex(1)
                            rocketSprite!.active = false
                            explo!.node.active = true
                            explo!.node.angle = -this.rockets[i].angle
                            bro!.node.active = true
                            bro!.node.angle = -this.rockets[i].angle
                            explo?.play()
                            explo?.once(Animation.EventType.FINISHED, () => {
                                explo!.node.active = false
                                this.rockets[i].setWorldPosition(new Vec3(0, -100))
                            })
                            bro?.play()
                            bro?.once(Animation.EventType.FINISHED, () => {
                                bro!.node.active = false
                                this.rockets[i].setWorldPosition(new Vec3(0, -100))
                            })

                            if (i == 5) {
                                for (let i = 0; i < 6; i++) {
                                    tileList[i].onDead(
                                        this.game!.board as Board,
                                        i % 2 == 0,
                                        i % 2 == 0 ? tileList[i + 1] : tileList[i - 1]
                                    )
                                    tileList[i].kill()
                                }
                                this.game?.turnOnInput()
                                this.itemManager?.showAll()
                                this.enableFunction()
                                this.overlay!.active = false
                                this.itemManager!.botOverlay!.active = false
                            }
                            this.game?.switchTurn(Turn.MATCH)
                        })
                        .start()
                })
                .start()
        }
    }

    getAngleBetween(from: Vec3, to: Vec3): number {
        const dx = to.x - from.x
        const dy = to.y - from.y
        const radians = Math.atan2(dy, dx)
        const degrees = (radians * 180) / Math.PI
        return degrees - 90 + 25
    }
    getRandomMatchingPair(exclude: Set<Tile> = new Set()): [Tile, Tile] | null {
        const board = this.game?.board?.board
        if (!board) return null

        const typeMap = new Map<number, Tile[]>()

        // Gom nhóm tile theo type
        for (const row of board) {
            for (const tile of row) {
                const typedTile = tile as Tile
                if (exclude.has(typedTile)) continue
                const type = tile.getTypeID()
                if (type === TileType.NONE) continue

                if (!typeMap.has(type)) {
                    typeMap.set(type, [])
                }
                typeMap.get(type)!.push(typedTile)
            }
        }

        // Lọc nhóm có ít nhất 2 tile
        const validGroups = Array.from(typeMap.values()).filter((group) => group.length >= 2)
        if (validGroups.length === 0) return null

        // Chọn nhóm ngẫu nhiên
        const group = validGroups[Math.floor(Math.random() * validGroups.length)]

        // Chọn 2 tile ngẫu nhiên trong nhóm
        const shuffled = group.slice().sort(() => Math.random() - 0.5)

        return [shuffled[0], shuffled[1]]
    }
}
export default SuperRocketItem
