import { Turn } from '../../type/global'
import { LevelLoader } from '../level/LevelLoader'
import { BaseTurn } from './BaseTurn'
export class FailTurn extends BaseTurn {
    onEnter(): void {
        console.log('Fail')
    }

    onExit(): void {}
    onUpdate(): void {}
}
