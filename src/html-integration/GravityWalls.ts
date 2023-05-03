import * as Matter from "matter-js";
import {Position} from "../types";

export class GravityWalls {
    private readonly groundTop;
    private readonly groundBottom;
    private readonly groundLeft;
    private readonly groundRight;

    private readonly wallWidth = 1000;

    private readonly containerRect: DOMRect;
    constructor(container: HTMLElement) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        this.containerRect = container.getBoundingClientRect();
        this.groundTop = Matter.Bodies.rectangle(containerWidth / 2, -(this.wallWidth / 2), containerWidth, this.wallWidth, {
            isStatic: true,
            render: { fillStyle: "transparent" },
        });
        this.groundBottom = Matter.Bodies.rectangle(containerWidth / 2, containerHeight + this.wallWidth / 2, containerWidth, this.wallWidth, {
            isStatic: true,
            render: { fillStyle: "transparent" },
        });
        this.groundLeft = Matter.Bodies.rectangle(-(this.wallWidth / 2), containerHeight / 2, this.wallWidth, containerHeight, {
            isStatic: true,
            render: { fillStyle: "transparent" },
        });
        this.groundRight = Matter.Bodies.rectangle(containerWidth + this.wallWidth / 2, containerHeight / 2, this.wallWidth, containerHeight, {
            isStatic: true,
            render: { fillStyle: "transparent" },
        });
    }

    public getWalls() {
        return [this.groundTop, this.groundBottom, this.groundLeft, this.groundRight]
    }

    public isIntersectingWalls(position: Position) {
        return (
            position.x > (this.containerRect.left + this.containerRect.width)
            || position.x < this.containerRect.left
            || position.y < this.containerRect.top
            || position.y > (this.containerRect.top + this.containerRect.height)
        )
    }
}