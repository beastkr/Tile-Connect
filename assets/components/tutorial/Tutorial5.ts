import { _decorator } from 'cc'
import { BaseTutorial } from './BaseTutorial'
import { Item, Popup } from '../../type/global'
import Board from '../board/Board'
import GameManager from '../manager/GameManager'
import { UImanager } from '../ui-manager/UImanager'

const { ccclass } = _decorator

@ccclass('Level5Tutorial')
export class Level5Tutorial extends BaseTutorial {
    begin(board: Board, gm: GameManager) {
        this.gm = gm
        this.currentBoard = board
        this.resetAllSiblingIndices(board)
        this.setupOverlay()
        UImanager.showPopup(Popup.BOOMTUTORIAL, true, this.gm?.currentNumber())
        this.gm.turnOffInput()
    }

    end() {
        UImanager.hideAllPopups()
        this.hideOverlay()
        this.hidePanel()

        this.gm?.itemManager?.hideAll()
        this.gm?.itemManager?.showItem(Item.HINT)
        this.gm?.itemManager?.showItem(Item.SHUFFLE)

        this.gm!.board?.resetInput()
        this.gm?.turnOnInput()
        this.cleanup()
    }
}
