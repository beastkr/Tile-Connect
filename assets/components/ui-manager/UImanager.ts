import { _decorator, Component, Node } from 'cc'
import { Popup } from './../../type/global'
const { ccclass, property } = _decorator

@ccclass('UImanager')
export class UImanager extends Component {
    private popupNodes: Map<Popup, Node> = new Map()
    private static instance: UImanager | null = null

    start() {
        UImanager.instance = this
        this.cachePopupNodes()
        this.hideAllPopups()
    }
    private hideAllPopups() {
        this.popupNodes.forEach((node, type) => {
            node.active = false
        })
    }
    public static showPopup(popupType: Popup, hideOthers: boolean = true) {
        if (!UImanager.instance) {
            console.warn('UIManager instance not found!')
            return
        }

        if (hideOthers) {
            UImanager.instance.hideAllPopups()
        }

        const popup = UImanager.instance.popupNodes.get(popupType)
        if (popup) {
            popup.active = true
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
        if (popup) {
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
                console.log(`Cached popup: ${popupType}`)
            } else {
                console.warn(`Popup node not found: ${popupType}`)
            }
        })
    }
}
