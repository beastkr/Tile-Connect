import { _decorator, Component, Node, Label } from 'cc'
import GameManager from './GameManager'
import Board from '../board/Board'
import { Level1Tutorial } from '../tutorial/Tutorial1'
import { Level2Tutorial } from '../tutorial/Tutorial2'
import { Level3Tutorial } from '../tutorial/Tutorial3'
import { BaseTutorial } from '../tutorial/BaseTutorial'

const { ccclass, property } = _decorator

@ccclass('TutorialManager')
export class TutorialManager extends Component {
    @property(Node) overlay: Node | null = null
    @property(Node) panel: Node | null = null
    @property(Label) help: Label | null = null
    @property(Node) hand: Node | null = null

    public static instance: TutorialManager | null = null
    private tutorials: Map<number, BaseTutorial> = new Map()
    private currentTutorial: BaseTutorial | null = null

    start() {
        TutorialManager.instance = this
        this.initializeTutorials()
        this.hand!.active = false
        this.panel!.active = false
    }


    private initializeTutorials() {
        const level1Tutorial = this.node.addComponent(Level1Tutorial)
        const level2Tutorial = this.node.addComponent(Level2Tutorial)
        const level3Tutorial = this.node.addComponent(Level3Tutorial)


        this.setTutorialProperties(level1Tutorial)
        this.setTutorialProperties(level2Tutorial)
        this.setTutorialProperties(level3Tutorial)

        this.tutorials.set(1, level1Tutorial)
        this.tutorials.set(2, level2Tutorial)
        this.tutorials.set(3, level3Tutorial)
    }

    private setTutorialProperties(tutorial: BaseTutorial) {
        ;(tutorial as any).overlay = this.overlay
        ;(tutorial as any).panel = this.panel
        ;(tutorial as any).help = this.help
        ;(tutorial as any).hand = this.hand
    }

    public static showCurrentTutorial(level: number, board?: Board, gm?: GameManager) {
        if (!TutorialManager.instance || level > 3) return

        if (board && gm) {
            TutorialManager.instance.startTutorial(level, board, gm)
        }
    }

    private startTutorial(level: number, board: Board, gm: GameManager) {
        if (this.currentTutorial) {
            this.currentTutorial.end()
        }

        const tutorial = this.tutorials.get(level)
        if (tutorial) {
            this.currentTutorial = tutorial
            tutorial.begin(board, gm)
        }
    }

    public endCurrentTutorial() {
        if (this.currentTutorial) {
            this.currentTutorial.end()
            this.currentTutorial = null
        }
    }

    public showObstacle() {
        if (this.currentTutorial instanceof Level1Tutorial) {
            this.currentTutorial.showObstacle()
        }
    }

    public showInvalid() {
        if (this.currentTutorial instanceof Level1Tutorial) {
            this.currentTutorial.showInvalid()
        }
    }
}
