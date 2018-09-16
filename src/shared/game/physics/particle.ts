import GameObject from "../base/game-object";
import Vector2 from "../../data/vector2";
import Shape from "../shapes/shape";
import {injectable, unmanaged} from "inversify";
import Updatable from "../base/updatable";

/**
 * Движимая частица с формой и цветом без столкновений
 */
@injectable()
export default abstract class Particle extends GameObject implements Updatable<Particle> {

    protected readonly _shape: Shape;

    public get shape(): Shape {
        return this._shape;
    }

    public get position(): Vector2 {
        return this._shape.position;
    }

    public set position(value: Vector2) {
        this._shape.position = value;
    }

    protected readonly _isStatic;

    public get isStatic(): boolean {
        return this._isStatic;
    }

    public linearVelocity: Vector2 = Vector2.ZERO;

    protected constructor(@unmanaged() shape: Shape, @unmanaged() isStatic: boolean = false) {
        super();

        this._shape = shape;
        this._isStatic = isStatic;
    }

    public draw(canvasContext: CanvasRenderingContext2D): void {
        canvasContext.fillStyle = this.color;
        this._shape.draw(canvasContext);
    }

    public abstract step(dt: number): void;

    public updateBy(particle: Particle): void {
        super.updateBy(particle);
        this._shape.updateBy(particle._shape);
        this.linearVelocity = Vector2.parse(particle.linearVelocity);
    }

}