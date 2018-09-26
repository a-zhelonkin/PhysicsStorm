import {injectable} from "inversify";
import container from "../../inversify.config";
import TYPES from "../../inversify.types";
import Vector, {default as Vector2} from "../../data/vector2";
import Bullet from "./bullet";
import RigidBody from "../physics/rigid-body";
import World from "../world";
import Updatable from "../base/updatable";
import {METAL} from "../physics/material/materials";
import Circle from "../geometry/shapes/circle";
import Box from "../geometry/shapes/box";

@injectable()
export default class Player extends RigidBody implements Updatable<Player> {

    public maxVelocity: number = 0.01;

    public jumpStrength: number = 0.005;

    private _direction: number = 0;

    public constructor() {
        // super(new Circle(new Vector(0, 0), 30), METAL);
        // super(new Circle(new Vector(200, 1000), 30), METAL);
        super(new Box(new Vector(), new Vector2(1, 1)), METAL);
    }

    public step(dt: number): void {
        super.step(dt);

        if (this.linearVelocity.x > this.maxVelocity) {
            this.linearVelocity = new Vector(this.maxVelocity, this.linearVelocity.y);
        } else if (this.linearVelocity.x < -this.maxVelocity) {
            this.linearVelocity = new Vector(-this.maxVelocity, this.linearVelocity.y);
        }

        switch (this._direction) {
            case 1:
                this.applyForce(new Vector(this.maxVelocity, 0));
                break;
            case 0:
                if (this.linearVelocity.x !== 0) {
                    this.linearVelocity = new Vector(this.linearVelocity.x * 0.8, this.linearVelocity.y);
                }
                break;
            case -1:
                this.applyForce(new Vector(-this.maxVelocity, 0));
                break;
        }
    }

    public right(): void {
        this._direction = 1;
    }

    public left(): void {
        this._direction = -1;
    }

    public stop(): void {
        this._direction = 0;
    }

    public jump(): void {
        this.applyForce(new Vector(0, this.jumpStrength));
    }

    public shoot(target: Vector2): void {
        // container.get<World>(TYPES.World).addObject(new Bullet(this._shape.position, target));
    }

    public updateBy(player: Player) {
        super.updateBy(player);
        this.maxVelocity = player.maxVelocity;
        this.jumpStrength = player.jumpStrength;
    }

}