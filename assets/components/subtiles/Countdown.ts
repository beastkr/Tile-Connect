import { _decorator, Component, Node, Sprite } from 'cc';
import { LevelLoader } from '../level/LevelLoader';
const { ccclass, property } = _decorator;

@ccclass('Countdown')
export class Countdown extends Component {
    private timer: number = 10; 
    private currentTime: number = 0;  
    
    start() {
        const sprite = this.node.getComponent(Sprite);
        if (sprite) {
            sprite.fillRange = -1;
        }
    }

    update(deltaTime: number) {
        this.currentTime += deltaTime;
        
        const progress = Math.min(this.currentTime / this.timer, 1);
        
        const sprite = this.node.getComponent(Sprite);
        if (sprite) {
            sprite.fillRange =-1+ progress;
        }
        
        if (this.currentTime >= this.timer) {
            this.onCountdownComplete();
        }
    }
    
    private onCountdownComplete() {
        console.log("Countdown completed!");
        this.enabled = false;
        this.resetCountdown()
    }
    
    public resetCountdown() {
        this.currentTime = 0;
        const sprite = this.node.getComponent(Sprite);
        if (sprite) {
            sprite.fillRange = -1;
        }
        this.enabled = true;
    }
    
    public setCountdownTime(newTime: number) {
        this.timer = newTime;
        this.resetCountdown();
    }
}