import { _decorator, Component, director, ProgressBar, resources, SpriteFrame } from 'cc'
const { ccclass, property } = _decorator
@ccclass('AssetLoader')
export class AssetLoader extends Component {
    @property(ProgressBar)
    private progressBar!: ProgressBar
    protected __preload(): void {
        console.log('preloading')
        if (!this.progressBar) throw new Error('ProgressBar is required')
        director.preloadScene('Prototype')
        resources.preloadDir('sprite')
        resources.preloadDir('sprite/AllTiles')
        // resources.preloadDir('font')
        resources.preloadDir('texture-2d')
        resources.preloadDir('ui-assets')
    }

    start() {
        resources.loadDir(
            'sprite/AllTiles',
            SpriteFrame,
            (finished, total) => {
                this.updateProgressBar(finished / total)
            },
            (error) => {
                if (error) {
                    console.error(error)
                } else {
                    this.updateProgressBar(1)
                    this.switchToGameScene()
                }
            }
        )
    }

    private updateProgressBar(progress: number) {
        this.progressBar!.progress = progress
    }

    private switchToGameScene() {
        director.loadScene('Prototype')
    }
}
