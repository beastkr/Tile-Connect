import { _decorator, Component, Vec2 } from 'cc'
import { Direction, directionValue } from '../../type/global'
import { Level } from '../level/Level'
const { ccclass, property } = _decorator

@ccclass('GravityManager')
export class GravityManager extends Component {
    static direction: Vec2 = new Vec2()
    static gravityChangable: boolean = true
    static changeGravity(dir: Direction) {
        switch (dir) {
            case Direction.DOWN:
                GravityManager.direction = directionValue.down
                break
            case Direction.UP:
                GravityManager.direction = directionValue.up
                break
            case Direction.LEFT:
                GravityManager.direction = directionValue.left
                break
            case Direction.RIGHT:
                GravityManager.direction = directionValue.right
                break
            default:
                GravityManager.direction = directionValue.none
                break
        }
    }
    static setUpManager(level: Level) {
        this.changeGravity(Direction.DOWN)
    }
    static cycleGravity() {
        if (!this.gravityChangable) return

        // Only cycle through UP, RIGHT, DOWN, LEFT
        let nextDir: Direction
        switch (this.getCurrentDirection()) {
            case Direction.UP:
                nextDir = Direction.RIGHT
                break
            case Direction.RIGHT:
                nextDir = Direction.DOWN
                break
            case Direction.DOWN:
                nextDir = Direction.LEFT
                break
            case Direction.LEFT:
                nextDir = Direction.UP
                break
            default:
                nextDir = Direction.NONE // Default to UP if current direction is NONE or invalid
        }

        this.changeGravity(nextDir)
    }

    static getCurrentDirection(): Direction {
        const dir = this.direction
        if (dir.equals(directionValue.up)) return Direction.UP
        if (dir.equals(directionValue.right)) return Direction.RIGHT
        if (dir.equals(directionValue.down)) return Direction.DOWN
        if (dir.equals(directionValue.left)) return Direction.LEFT
        return Direction.NONE
    }
}
