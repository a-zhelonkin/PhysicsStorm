import "reflect-metadata";
import Particle from "./physics/particle";
import {physicInterval} from "../constants";
import {injectable} from "inversify";
import GameObject from "./base/game-object";
import Vector2 from "../data/vector2";
import RigidBody from "./physics/rigid-body";
import WorldGenerator from "./world-generator";
import GeometryUtils from "../utils/geometry-utils";

@injectable()
export default class World {

    private _particles: Particle[] = [];

    public get particles(): GameObject[] {
        return this._particles;
    }

    private _onPhysicsUpdate: any;

    public set onPhysicsUpdate(onPhysicsUpdate: any) {
        this._onPhysicsUpdate = onPhysicsUpdate;
    }

    public start(): void {
        new WorldGenerator(this).generate();

        let lastUpdate: number = Date.now();
        setInterval(() => {
            const now = Date.now();
            const dt = now - lastUpdate;
            lastUpdate = now;

            this.updatePhysics(dt / 1000);
        }, physicInterval);
    }

    public update(state: Particle[]): void {
        for (let object of state) {
            for (let gameObject of this._particles) {
                if (object.id === gameObject.id) {
                    gameObject.updateBy(object);
                    break;
                }
            }
        }
    }

    public addObject(object: Particle): void {
        this._particles.push(object);
    }

    public remove(id: string): void {
        this._particles = this._particles.filter(x => x.id !== id);
    }

    public updatePhysics(dt: number): void {
        for (let particle of this._particles) {
            if (particle.isStatic) {
                continue;
            }

            particle.step(dt);

            if (particle.position.y < 0) {
                particle.position = new Vector2(particle.position.x, 0);
                if (particle instanceof RigidBody) {
                    const rigidBody = particle as RigidBody;
                    rigidBody.linearVelocity = new Vector2(rigidBody.linearVelocity.x, 0);
                }
            }

            for (let collide of this._particles) {
                if (particle.id === collide.id) continue;

                const vector2 = GeometryUtils.collide(particle.shape, collide.shape);
                if (vector2) {
                    if (particle instanceof RigidBody) {
                        particle.resolveCollision(vector2);
                        World.resolveCollision(particle, collide as RigidBody, vector2);
                    }
                }
            }
        }

        this._onPhysicsUpdate && this._onPhysicsUpdate();
    }

    private static resolveCollision(a: RigidBody, b: RigidBody, penetration: Vector2): void {
        const normal: Vector2 = penetration.normalized;

        const relativeVelocity: Vector2 = b.linearVelocity.subtract(a.linearVelocity);
        const velocityAlongNormal: number = relativeVelocity.dotProduct(normal);

        if (velocityAlongNormal > 0) {
            return;
        }

        const restitution: number = Math.min(a.material.restitution, b.material.restitution);

        const j: number = -(1 + restitution) * velocityAlongNormal / (a.massData.inverse_mass + b.massData.inverse_mass);

        const impulse: Vector2 = normal.factor(j);
        a.linearVelocity = a.linearVelocity.subtract(impulse.factor(a.massData.inverse_mass));
        b.linearVelocity = b.linearVelocity.add(impulse.factor(b.massData.inverse_mass));
    }
}