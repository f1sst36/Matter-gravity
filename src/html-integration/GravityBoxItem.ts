import * as Matter from "matter-js";

type TOptions = {
	parentContainer: HTMLElement;
	container: HTMLElement;
};

export default class GravityBoxItem {
	width: number;
	height: number;
	body: Matter.Body;
	elem: HTMLElement;
	parentContainerRect: DOMRect;

    maxVelocity: number;
    maxImpulse: number;

	constructor(options: TOptions) {
        this.maxVelocity = 20
        this.maxImpulse = 25

		const rect = options.container.getBoundingClientRect();
		this.parentContainerRect = options.parentContainer.getBoundingClientRect();

		let borderRadius = +window.getComputedStyle(options.container).borderRadius.replace("px", "");
		if (Object.is(borderRadius, NaN)) {
			borderRadius = 0;
		}
		this.width = rect.width;
		this.height = rect.height;
		this.body = Matter.Bodies.rectangle(Math.random() * 500, Math.random() * 500, this.width, this.height, {
			chamfer: {
				radius: borderRadius,
			},
			render: {
				fillStyle: "transparent",
			},
		});

		this.elem = options.container;
	}

	moveToPosition = (position) => {
		var dx = position.x - this.body.position.x;
		var dy = position.y - this.body.position.y;
		var distance = Math.sqrt(dx * dx + dy * dy);

		if (distance < 5) {
			return;
		}

		var speed = distance / 20;
		var vx = (dx / distance) * speed;
		var vy = (dy / distance) * speed;

		Matter.Body.translate(this.body, { x: vx, y: vy });
	};

	limitVelocityAndImpulse = () => {
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

	isBodyPositionInvalid = (top: number, left: number) => {
		return (
			top > this.parentContainerRect.height + this.parentContainerRect.top + 10 ||
			top < this.parentContainerRect.top - 10 ||
			left > this.parentContainerRect.left + this.parentContainerRect.width + 10 ||
			left < this.parentContainerRect.left - 10
		);
	};

	render() {
		this.limitVelocityAndImpulse();
		const { x, y } = this.body.position;

		const top = y - this.height / 2;
		const left = x - this.width / 2;

        // FIXME - Объекты, которые выпадают за пределы стен иногда появляются в левом верхнем углу
		if (this.isBodyPositionInvalid(top, left)) {
			Matter.Body.setPosition(this.body, {
				x: Math.min(Math.max(this.body.position.x - 20, 20), this.parentContainerRect.width - 20),
				y: Math.min(Math.max(this.body.position.y - 20, 20), this.parentContainerRect.height - 20),
			});
		}

		this.elem.style.top = `${top}px`;
		this.elem.style.left = `${left}px`;
		this.elem.style.transform = `rotate(${this.body.angle}rad)`;
	}
}
