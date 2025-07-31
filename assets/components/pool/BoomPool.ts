import {
    _decorator,
    Component,
    Node,
    Prefab,
    instantiate,
    Animation,
    Vec3,
    AnimationClip,
} from 'cc'
const { ccclass, property } = _decorator

@ccclass('BoomPool')
export class BoomPool extends Component {
    @property(Node)
    firstNode!: Node
    @property(Node)
    secondNode!: Node
    private firstAnimationNodes: Node[] = []
    private secondAnimationNodes: Node[] = []

    start() {
        this.initializeNodes()
        this.playAnimationSequence()
    }

    private initializeNodes() {
        if (!this.firstNode) {
            const foundFirstNode = this.node.getChildByName('first')
            if (foundFirstNode) {
                this.firstNode = foundFirstNode
                this.firstNode.active = false
            } else {
                throw new Error("Child node 'first' not found")
            }
        }
        if (!this.secondNode) {
            const foundSecondNode = this.node.getChildByName('second')
            if (foundSecondNode) {
                this.secondNode = foundSecondNode
                this.secondNode.active = false
            } else {
                throw new Error("Child node 'second' not found")
            }
        }

        if (this.firstNode) {
            this.firstAnimationNodes = []
            for (let i = 0; i < this.firstNode.children.length; i++) {
                const child = this.firstNode.children[i]
                const animation = child.getComponent(Animation)
                if (animation) {
                    this.firstAnimationNodes.push(child)
                }
            }
        }

        if (this.secondNode) {
            this.secondAnimationNodes = []
            for (let i = 0; i < this.secondNode.children.length; i++) {
                const child = this.secondNode.children[i]
                const animation = child.getComponent(Animation)
                if (animation) {
                    this.secondAnimationNodes.push(child)
                }
            }
        }
    }

    public playAnimationSequence() {
        this.playFirstAnimations().then(() => {
            //this.playSecondAnimations()
        })
    }

    private async playFirstAnimations(): Promise<void> {
        if (this.firstAnimationNodes.length === 0) {
            return Promise.resolve()
        }

        this.firstNode.active = true

        const animationPromises: Promise<void>[] = []

        this.firstAnimationNodes.forEach((node) => {
            const animation = node.getComponent(Animation)
            if (animation && animation.clips.length > 0) {
                node.active = true

                const promise = new Promise<void>((resolve) => {
                    animation.once(Animation.EventType.FINISHED, () => {
                        resolve()
                    })

                    if (animation.clips[0]) {
                        animation.play(animation.clips[0].name)
                    } else {
                        resolve()
                    }
                })

                animationPromises.push(promise)
            }
        })

        await Promise.all(animationPromises)

        this.firstNode.active = false
    }

    private async playSecondAnimations(): Promise<void> {
        if (this.secondAnimationNodes.length === 0) {
            return Promise.resolve()
        }

        this.secondNode.active = true

        const animationPromises: Promise<void>[] = []

        this.secondAnimationNodes.forEach((node) => {
            const animation = node.getComponent(Animation)
            if (animation && animation.clips.length > 0) {
                node.active = true

                const promise = new Promise<void>((resolve) => {
                    animation.once(Animation.EventType.FINISHED, () => {
                        resolve()
                    })

                    if (animation.clips[0]) animation.play(animation.clips[0].name)
                })

                animationPromises.push(promise)
            }
        })

        await Promise.all(animationPromises)

        this.secondNode.active = false
    }
}
