import { _decorator, Color, Component, Contact2DType, instantiate, Node, Prefab, RigidBody2D, Sprite, Tween, tween, Vec2, Vec3 } from 'cc';
import { getAllDescendants } from '../../type/global';
const { ccclass, property } = _decorator;

@ccclass('ConfettiManager')
export class ConfettiManager extends Component {
    @property(Prefab)
    confettiList: Prefab[] = []
    confettiRigid: RigidBody2D[] = []
    @property(Vec2)
    dir: Vec2 = new Vec2()

    start() {
        for (const conf of this.confettiList) {
            for (let i = 1; i < 20; i++) {
                const node = instantiate(conf)
                this.node.addChild(node)
                const rb = node.getComponent(RigidBody2D)
                this.confettiRigid.push(rb!)
                node.active = false
            }
        }


    }

    update(deltaTime: number) {
        const damping = 0.98; // horizontal & vertical slow down
        const gravity = -15; // downward acceleration

        for (const c of this.confettiRigid) {
            // Apply gravity
            c.linearVelocity = new Vec2(
                c.linearVelocity.x * damping, // slow horizontal
                c.linearVelocity.y + gravity * deltaTime // fall
            );

            // Optional: clamp to a minimum speed to avoid infinite drift
            if (Math.abs(c.linearVelocity.x) < 0.1) c.linearVelocity.x = 0;
            if (Math.abs(c.linearVelocity.y) < 0.1) c.linearVelocity.y = 0;
            if (c.node.position.y < -200) this.kill(c.node)
        }

    }

    public emit() {
        this.resetConf();

        for (const c of this.confettiRigid) {
            c.node.active = true;

            // Random color
            const sprite = c.node.getComponent(Sprite);
            const randColor = new Color(
                Math.floor(Math.random() * 256), // R
                Math.floor(Math.random() * 256), // G
                Math.floor(Math.random() * 256), // B
                255                              // A
            );
            if (sprite) {
                sprite.color = randColor
            }

            // Fade out after 5s

            tween(c.node.getComponent(Sprite)!)
                .delay(2.5 + Math.random() * 0.2)
                .to(0.5, { color: new Color(randColor.r, randColor.g, randColor.b, 0) })
                .start();

            // Base force from initial direction (scaled)
            const baseSpeed = 50; // tweak this for stronger launch
            const dirForce = new Vec2(this.dir.x * baseSpeed, this.dir.y * baseSpeed);

            // Add some random variation
            const randomForceX = (-10 + Math.random() * 50);
            const randomForceY = (0 + Math.random() * 50);

            // Apply velocities
            c.angularVelocity = (1 + Math.random() * 2) * (Math.random() < 0.5 ? 1 : -1);
            c.linearVelocity = new Vec2(
                this.dir.x > 0 ? dirForce.x + randomForceX : dirForce.x - randomForceX,
                dirForce.y + randomForceY
            );

            c.gravityScale = 0.3;

            // Increase gravity later for a faster fall
            setTimeout(() => {
                if (c.node && c.node.isValid) {
                    c.gravityScale = 0.5 + Math.random() * 0.5;
                }
            }, 400);
        }
    }

    kill(c: Node) {
        c.active = false
        const des = getAllDescendants(c)

        Tween.stopAllByTarget(c)
        Tween.stopAllByTarget(c.getComponent(Sprite)!)


    }

    resetConf() {
        for (const c of this.confettiRigid) {
            this.kill(c.node)
            c.node.position = new Vec3()
            c.linearVelocity = new Vec2()

        }
    }
}


