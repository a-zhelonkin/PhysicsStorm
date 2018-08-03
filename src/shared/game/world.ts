import "reflect-metadata";
import Particle from "./entities/physics/particle";
import {physicInterval} from "../constants";
import {injectable} from "inversify";
import GameObject from "./entities/base/game-object";

@injectable()
export default class World {

    private _objects: GameObject[] = [];
    private _lastUpdate: number;

    public get state(): GameObject[] {
        return this._objects;
    }

    public start(): void {
        setInterval(() => {
            const now = Date.now();
            const dt = now - this._lastUpdate;
            this._lastUpdate = now;

            for (let gameObject of this._objects) {

                if (gameObject instanceof Particle) {
                    gameObject.move(dt);
                }

                if (gameObject.position.y < 0) gameObject.position.y = 0;
            }
        }, physicInterval);
    }

    public get objects(): GameObject[] {
        return this._objects;
    }

    public addObject(object): void {
        this._objects.push(object);
    }

    public remove(id): void {
        this._objects = this._objects.filter(x => x.id !== id);
    }

    public update(state: GameObject[]): void {
        for (let object of state) {
            for (let gameObject of this._objects) {
                if (object.id === gameObject.id) {
                    gameObject.updateBy(object);
                    break;
                }
            }
        }
    }
}