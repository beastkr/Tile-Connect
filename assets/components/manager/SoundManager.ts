import { _decorator, AudioSource, Component, AudioClip, Node, director, resources } from 'cc';
import { SFX } from '../../type/global';

const { ccclass, property } = _decorator;

@ccclass('SoundManager')
export class SoundManager extends Component {
    public static instance: SoundManager;

    @property({ type: [AudioClip] })
    public audioClips: AudioClip[] = [];
    public soundOn: boolean = true
    public musicOn: boolean = true
    public vibrateOn: boolean = true

    private sfxMap: Map<string, AudioSource> = new Map();

    start() {
        if (!SoundManager.instance) {
            SoundManager.instance = this;
            // Giữ lại khi load scene khác
            director.addPersistRootNode(this.node);
        } else {
            this.destroy();
            return;
        }
        this.setUpAudio();
    }

    private loaded = false;

    private setUpAudio() {
        const sfxKeys = Object.values(SFX).filter(v => typeof v === 'string') as string[];
        let loadedCount = 0;

        sfxKeys.forEach(sfxKey => {
            resources.load(`sfx/${sfxKey}`, AudioClip, (err, clip) => {
                if (!err && clip) {
                    const node = new Node(`Audio_${sfxKey}`);
                    node.parent = this.node;
                    const audioSource = node.addComponent(AudioSource);
                    audioSource.clip = clip;
                    audioSource.playOnAwake = false;
                    this.sfxMap.set(sfxKey as SFX, audioSource);
                }
                loadedCount++;
                if (loadedCount === sfxKeys.length) {
                    this.loaded = true;
                }
            });
        });
    }

    public playSFX(sfx: string) {
        if (!this.soundOn) return
        if (!this.loaded) {
            console.warn(`SFX chưa load xong: ${sfx}`);
            return;
        }
        this.sfxMap.get(sfx)?.play();
    }
    public stopSFX(sfx: string) {
        if (!this.loaded) {
            console.warn(`SFX chưa load xong: ${sfx}`);
            return;
        }
        this.sfxMap.get(sfx)?.stop();
    }

}
