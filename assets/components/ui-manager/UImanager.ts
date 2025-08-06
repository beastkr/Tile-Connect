import { _decorator, Component, Node, tween, Vec3, view, Widget } from 'cc'
import { Popup } from './../../type/global'
import { BasePopup } from './basePopup'

const { ccclass, property } = _decorator

@ccclass('UImanager')
export class UImanager extends Component {
    @property(Node)
    top: Node | null = null
    @property(Node)
    bot: Node | null = null
    @property(Node)
    overlay: Node | null = null
    @property(Node)
    itembar: Node | null = null
    private popupNodes: Map<Popup, Node> = new Map()
    private popupComponents: Map<Popup, BasePopup> = new Map()
    private static instance: UImanager | null = null
    @property(Node)
    pauseButton: Node | null = null

    start() {
        UImanager.instance = this
        this.cachePopupNodes()
        this.hideAllPopups()
        this.resize()
        view.on('canvas-resize', this.resize, this)
    }

    resize() {
        const v = view.getVisibleSize()
        const barWidget = this.itembar?.getComponent(Widget)
        if (!barWidget) return
        if (v.width >= v.height) {
            this.bot!.active = false
            this.top?.addChild(this.itembar!)
            barWidget!.target = this.top
            barWidget.isAlignRight = true
            barWidget.right = 100
            barWidget.isAlignVerticalCenter = true
            barWidget.verticalCenter = 10
        } else {
            this.bot!.active = true
            this.bot?.addChild(this.itembar!)
            barWidget!.target = this.bot
            barWidget.isAlignHorizontalCenter = true
            barWidget.horizontalCenter = 0
            barWidget.isAlignVerticalCenter = true
            barWidget.verticalCenter = 40
        }
    }

    public static togglePauseButton(active?: boolean) {
        if (!active)
            UImanager.instance!.pauseButton!.active = !UImanager.instance!.pauseButton!.active
        else UImanager.instance!.pauseButton!.active = active
    }

    private hideAllPopups() {
        UImanager.instance!.overlay!.active = false
        this.popupNodes.forEach((node, type) => {
            const popupComponent = this.popupComponents.get(type)
            if (popupComponent && node.active) {
                popupComponent.onPopupHide()
            }
            node.active = false
        })
    }

    public static showPopup(popupType: Popup, hideOthers: boolean = true, curr: number) {
        if (!UImanager.instance) {
            console.warn('UIManager instance not found!')
            return
        }
        if (hideOthers) {
            UImanager.instance.hideAllPopups()
        }

        const popup = UImanager.instance.popupNodes.get(popupType)
        const popupComponent = UImanager.instance.popupComponents.get(popupType)

        if (popup) {
            UImanager.instance.overlay!.active = true
            popup.active = true
            popup.scale = new Vec3(0, 0, 1)
            tween(popup)
                .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
                .start()
            if (popupComponent) {
                popupComponent.onPopupShow(curr)
            }
        } else {
            console.warn(`Popup not found: ${popupType}`)
        }
    }

    public static hidePopup(popupType: Popup) {
        if (!UImanager.instance) {
            console.warn('UIManager instance not found!')
            return
        }

        const popup = UImanager.instance.popupNodes.get(popupType)
        const popupComponent = UImanager.instance.popupComponents.get(popupType)

        if (popup && popup.active) {
            UImanager.instance!.overlay!.active = false
            if (popupComponent) {
                popupComponent.onPopupHide()
            }
            popup.active = false
        }
    }

    public static hideAllPopups() {
        if (!UImanager.instance) {
            console.warn('UIManager instance not found!')
            return
        }

        UImanager.instance.hideAllPopups()
        console.log('Hidden all popups')
    }

    private cachePopupNodes() {
        Object.values(Popup).forEach((popupType) => {
            const node = this.node.getChildByName(popupType)
            if (node) {
                this.popupNodes.set(popupType, node)

                const popupComponent = node.getComponent(BasePopup)
                if (popupComponent) {
                    this.popupComponents.set(popupType, popupComponent)
                    console.log(`Cached popup component: ${popupType}`)
                }

                console.log(`Cached popup: ${popupType}`)
            } else {
                console.warn(`Popup node not found: ${popupType}`)
            }
        })
    }

    onDestroy() {
        this.popupComponents.forEach((component, type) => {
            if (component) {
                component.onPopupDestroy()
            }
        })
    }
}
