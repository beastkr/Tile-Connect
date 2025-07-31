import { Popup } from './../../type/global'
import { _decorator, Component, Node, tween, Vec3 } from 'cc'
import { BasePopup } from './basePopup'

const { ccclass, property } = _decorator

@ccclass('UImanager')
export class UImanager extends Component {
    private popupNodes: Map<Popup, Node> = new Map()
    private popupComponents: Map<Popup, BasePopup> = new Map()
    private static instance: UImanager | null = null

    start() {
        UImanager.instance = this
        this.cachePopupNodes()
        this.hideAllPopups()
    }

    private hideAllPopups() {
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
