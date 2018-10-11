import Vector2 from "../data/vector2";
import Importable from "../base/importable";
import RigidBody from "../physics/rigid-body";
import {RUBBER} from "../physics/material/materials";
import Circle from "../geometry/shapes/circle";
import EntityFactory from "../entity-factory";
import TYPES from "../../inversify.types";
import Exportable from "../base/exportable";

export default class Ball extends RigidBody implements Importable<Ball>, Exportable<Ball> {

    public constructor(id: string, position: Vector2, radius: number) {
        super(
            id || EntityFactory.newGuidTyped(TYPES.Ball),
            new Circle(position, radius),
            RUBBER
        );

        this.color = "#f00";
    }

    public static createNew(position: Vector2, radius: number): Ball {
        return new Ball(undefined, position, radius);
    }

    public static createFrom(ball: any): Ball {
        return new Ball(
            ball._id,
            Vector2.parse(ball._shape.position),
            ball._shape._radius
        );
    }

}