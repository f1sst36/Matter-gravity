import * as Matter from "matter-js";
import {Position} from "../types";

export default class BoxItem {
	private readonly width: number;
	private readonly height: number;
	public readonly body: Matter.Body;
	private readonly elem: HTMLElement;

	private readonly maxVelocity: number;
	private readonly maxImpulse: number;

	constructor(container: HTMLElement, position: Position) {
        this.maxVelocity = 20
        this.maxImpulse = 25

		const rect = container.getBoundingClientRect();

		let borderRadius = +window.getComputedStyle(container).borderRadius.replace("px", "");
		if (Object.is(borderRadius, NaN)) {
			borderRadius = 0;
		}
		this.width = rect.width;
		this.height = rect.height;
		this.body = Matter.Bodies.rectangle(position.x, position.y, this.width, this.height, {
			chamfer: {
				radius: borderRadius,
			},
			render: {
				fillStyle: "transparent",
			},
		});

		this.elem = container;
	}

	private limitVelocityAndImpulse(){
		if (this.body.velocity.x > this.maxVelocity) {
			Matter.Body.setVelocity(this.body, { x: this.maxVelocity, y: this.body.velocity.y });
		}

		if (this.body.velocity.y > this.maxVelocity) {
			Matter.Body.setVelocity(this.body, { x: this.body.velocity.x, y: this.maxVelocity });
		}

		if (this.body.positionImpulse.x > this.maxImpulse) {
			this.body.positionImpulse.x = this.maxImpulse;
		}

		if (this.body.positionImpulse.y > this.maxImpulse) {
			this.body.positionImpulse.y = this.maxImpulse;
		}
	};

	public moveToPosition(position) {
		const dx = position.x - this.body.position.x;
		const dy = position.y - this.body.position.y;
		const distance = Math.sqrt(dx * dx + dy * dy);

		if (distance < 5) {
			return;
		}

		const speed = distance / 20;
		// const speed = distance / 5;
		const vx = (dx / distance) * speed;
		const vy = (dy / distance) * speed;

		Matter.Body.translate(this.body, { x: vx, y: vy });
	};

	public remove() {
		//
	}

	public render() {
		this.limitVelocityAndImpulse();
		const { x, y } = this.body.position;

		const top = y - this.height / 2;
		const left = x - this.width / 2;

		this.elem.style.top = `${top}px`;
		this.elem.style.left = `${left}px`;
		this.elem.style.transform = `rotate(${this.body.angle}rad)`;
	}
}
