import {injectable} from "inversify";
import container from "../../inversify.config";
import TYPES from "../../inversify.types";
import Vector from "../../data/vector";
import Bullet from "./bullet";
import RigidBody from "./physics/rigid-body";
import Box from "./shapes/box";
import World from "../world";
import Updatable from "./base/updatable";

@injectable()
export default class Player extends RigidBody<Box> implements Updatable<Player> {

    public maxVelocity: Vector;

    public constructor() {
        super(new Box(new Vector(5, 5)));
        this.position = new Vector();
        this.linearVelocity = new Vector();
        this.maxVelocity = new Vector(0.5, 0.5);
    }

    public shoot(target): void {
        container.get<World>(TYPES.World).addObject(new Bullet(this.position, target));
    }

    public draw(context): void {
        const size = this.shape.size;

        context.fillStyle = this.color;
        context.fillRect(this.position.x, this.position.y, size.x, size.y);
    }

    public updateBy(player: Player) {
        super.updateBy(player);
        this.maxVelocity.updateBy(player.maxVelocity)
    }

}