import {Body, Bodies} from "matter-js";
import {Position} from "../types";

export class Duck {
    public readonly body: Body
    public readonly elem: HTMLElement
    private readonly rect: DOMRect
    private readonly areaContainer: HTMLElement

    constructor(areaContainer: HTMLElement, position: Position) {
        this.areaContainer = areaContainer
        this.elem = document.createElement('div')
        this.elem.classList.add('duck')
        this.elem.innerHTML = "I AM A DUCK"

        this.areaContainer.appendChild(this.elem)

        this.rect = this.elem.getBoundingClientRect();

        let borderRadius = +window.getComputedStyle(this.elem).borderRadius.replace("px", "");
        if (Object.is(borderRadius, NaN)) {
            borderRadius = 0;
        }
        this.body = Bodies.rectangle(position.x, position.y, this.rect.width, this.rect.height, {
            chamfer: {
                radius: borderRadius,
            },
            render: {
                fillStyle: "transparent",
            },
        });
    }

    public render() {
        const { x, y } = this.body.position;

        const top = y - this.rect.height / 2;
        const left = x - this.rect.width / 2;

        this.elem.style.top = `${top}px`;
        this.elem.style.left = `${left}px`;
        this.elem.style.transform = `rotate(${this.body.angle}rad)`;
    }
}