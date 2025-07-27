import { _decorator, Component, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Countdown')
export class Countdown extends Component {
    private timer: number = 60; 
    private currentTime: number = 0;  
    
    start() {
        const sprite = this.node.getComponent(Sprite);
        if (sprite) {
            sprite.fillRange = 0;
        }
    }

    update(deltaTime: number) {
        this.currentTime += deltaTime;
        
        const progress = Math.min(this.currentTime / this.timer, 1);
        
        const sprite = this.node.getComponent(Sprite);
        if (sprite) {
            sprite.fillRange = progress;
        }
        
        if (this.currentTime >= this.timer) {
            this.onCountdownComplete();
        }
    }
    
    private onCountdownComplete() {
        console.log("Countdown completed!");
        this.enabled = false;
    }
    
    public resetCountdown() {
        this.currentTime = 0;
        const sprite = this.node.getComponent(Sprite);
        if (sprite) {
            sprite.fillRange = 0;
        }
        this.enabled = true;
    }
    
    public setCountdownTime(newTime: number) {
        this.timer = newTime;
        this.resetCountdown();
    }
}