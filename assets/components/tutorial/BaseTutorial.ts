import { Component, Node, Label, Vec3, find, Widget } from 'cc'
import GameManager from '../manager/GameManager'
import Board from '../board/Board'
import Tile from '../tiles/Tile'
import { Item } from '../../type/global'

export abstract class BaseTutorial extends Component {
    protected gm: GameManager | null = null
    protected currentBoard: Board | null = null
    protected overlay: Node | null = null
    protected panel: Node | null = null
    protected help: Label | null = null
    protected hand: Node | null = null
    protected originalSiblingIndices: Map<Node, number> = new Map()
    protected boundOnChoose: (() => void) | null = null
    protected boundOnTouch: (() => void) | null = null

    abstract begin(board: Board, gm: GameManager): void
    abstract end(): void

    protected hideOverlay() {
        if (this.overlay) {
            this.overlay.active = false
        }
    }

    protected showPanel(text: string) {
        if (this.help && this.panel) {
            this.help.string = text
            this.panel.active = true
        }
    }

    protected hidePanel() {
        if (this.panel) {
            this.panel.active = false
        }
    }

    protected storeSiblingIndices(board: Board) {
        this.originalSiblingIndices.clear()
        for (const row of board.board) {
            for (const tile of row) {
                if (tile) {
                    const node = (tile as Tile).node
                    this.originalSiblingIndices.set(node, node.getSiblingIndex())
                }
            }
        }
    }

    protected setAllTilesToBackground(board: Board) {
        for (const row of board.board) {
            for (const tile of row) {
                if (tile) {
                    const node = (tile as Tile).node
                    node.setSiblingIndex(1)
                }
            }
        }
    }

    protected restoreAllSiblingIndices(board: Board) {
        for (const row of board.board) {
            for (const tile of row) {
                if (tile) {
                    const node = (tile as Tile).node
                    const originalIndex = this.originalSiblingIndices.get(node)
                    if (originalIndex !== undefined) {
                        node.setSiblingIndex(originalIndex)
                    }
                }
            }
        }
        this.originalSiblingIndices.clear()
    }

    protected resetAllSiblingIndices(board: Board) {
        if (this.originalSiblingIndices.size > 0) {
            this.restoreAllSiblingIndices(board)
        }
        this.originalSiblingIndices.clear()
    }

    protected hideHand() {
        if (this.hand) this.hand.active = false
    }
    protected clearOverlayEvents() {
        if (this.overlay) {
            this.overlay.off(Node.EventType.TOUCH_START)
            this.overlay.off(Node.EventType.TOUCH_END)
            this.overlay.off(Node.EventType.TOUCH_CANCEL)
            this.overlay.targetOff(this)
        }
    }

    protected setupOverlay() {
        if (!this.overlay) return

        this.clearOverlayEvents()

        this.overlay.setPosition(new Vec3(0, 50, 0))
        this.gm?.node.addChild(this.overlay)
        this.overlay.active = true
    }
    protected cleanup() {
        if (this.boundOnChoose) {
            this.gm?.offChoose(this.boundOnChoose)
            this.boundOnChoose = null
        }
        if (this.boundOnTouch) {
            this.gm?.offTouch(this.boundOnTouch)
            this.boundOnTouch = null
        }
    }
}
