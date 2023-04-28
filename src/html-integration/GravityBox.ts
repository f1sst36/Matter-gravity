import * as Matter from "matter-js";
import GravityBoxItem from "./GravityBoxItem";

const Engine = Matter.Engine,
	Render = Matter.Render,
	Runner = Matter.Runner,
	Bodies = Matter.Bodies,
	Events = Matter.Events,
	//Events = Matter.Events,
	//Body = Matter.Body,
	Composite = Matter.Composite,
	MouseConstraint = Matter.MouseConstraint;


// Изменять stiffness при коллизии драг объекта с любой из стен
// по дефолту 0.2 должно быть
const DEFAULT_STIFFNESS = 0.05
const LOWER_STIFFNESS = 0.005

type TOptions = {
	container: HTMLElement;
	items: HTMLElement[];
};
export default class GravityBox {
	engine: Matter.Engine;
	render: Matter.Render;
	runner: Matter.Runner;
	mouseConstraint: Matter.MouseConstraint;
	items: GravityBoxItem[];
	container: HTMLElement;

	wallWidth: number;

	dragBody: HTMLElement | null;
	isAttracted: boolean;
	targetPosition: { x: number; y: number };

	constructor(options: TOptions) {
		this.isAttracted = false;
		this.targetPosition = { x: 0, y: 0 };
		this.container = options.container;

		this.dragBody = null;
		this.wallWidth = 10;

		this.items = options.items.map(
			(item) => new GravityBoxItem({ container: item, parentContainer: options.container })
		);
		// engine?
		this.engine = Engine.create({});

		const containerWidth = options.container.clientWidth;
		const containerHeight = options.container.clientHeight;

		// create renderer
		this.render = Render.create({
			element: options.container,
			engine: this.engine,
			options: {
				width: containerWidth,
				height: containerHeight,
				wireframes: false,
				pixelRatio: 1,
				background: "white",
			},
		});

		this.runner = Runner.create();

		// mouse?
		this.mouseConstraint = MouseConstraint.create(
			// @ts-ignore
			this.engine,
			{
				element: options.container,
				constraint: {
					stiffness: DEFAULT_STIFFNESS,
					render: {
						visible: false,
					},
				},
			}
		);

		// fixme why 40px? its hello tag in the bottom shift all view
		const groundTop = Bodies.rectangle(containerWidth / 2, 0, containerWidth, this.wallWidth, {
			isStatic: true,
			render: { fillStyle: "tomato" },
		});
		const groundBottom = Bodies.rectangle(containerWidth / 2, containerHeight, containerWidth, this.wallWidth, {
			isStatic: true,
			render: { fillStyle: "tomato" },
		});
		const groundLeft = Bodies.rectangle(-1, containerHeight / 2, this.wallWidth, containerHeight, {
			isStatic: true,
			render: { fillStyle: "tomato" },
		});
		const groundRight = Bodies.rectangle(containerWidth + 1, containerHeight / 2, this.wallWidth, containerHeight, {
			isStatic: true,
			render: { fillStyle: "tomato" },
		});

		const walls = [groundBottom, groundRight, groundLeft, groundTop];

		Composite.add(this.engine.world, [...this.items.map((item) => item.body), this.mouseConstraint, ...walls]);
	}

	initEvents() {
		Events.on(this.mouseConstraint, "mousedown", (e) => {
			this.engine.gravity.scale = 0;
			this.targetPosition.x = e.mouse.position.x;
			this.targetPosition.y = e.mouse.position.y;

			this.isAttracted = true;
		});

		Events.on(this.mouseConstraint, "mousemove", (e) => {
			if (!this.isAttracted) {
				return;
			}

			this.targetPosition.x = e.mouse.position.x;
			this.targetPosition.y = e.mouse.position.y;
		});

		Events.on(this.mouseConstraint, "mouseup", () => {
			this.engine.gravity.scale = 0.001;
			this.isAttracted = false;
			this.targetPosition.x = 0;
			this.targetPosition.y = 0;
		});

		Events.on(this.engine, "beforeUpdate", () => {
			if (!this.isAttracted) {
				return;
			}

			this.items.forEach((body) => {
				body.moveToPosition(this.targetPosition);
			});
		});

		Events.on(this.mouseConstraint, "startdrag", (e) => {
			this.dragBody = e.body;
		});

		Events.on(this.mouseConstraint, "enddrag", () => {
			this.dragBody = null;
		});


        this.container.addEventListener("mouseenter", () => {
            this.mouseConstraint.constraint.stiffness = DEFAULT_STIFFNESS
		});

		this.container.addEventListener("mouseleave", () => {
            this.mouseConstraint.constraint.stiffness = LOWER_STIFFNESS
			Events.trigger(this.mouseConstraint, "mouseup");
			Events.trigger(this.mouseConstraint, "enddrag");
		});
	}

	start() {
		// const engine = this.engine;
		// const items = this.items;
		// (function rerender() {
		//     items.forEach(item=>item.render())
		//     Matter.Engine.update(engine);
		//     requestAnimationFrame(rerender);
		// })();
		Runner.run(this.runner, this.engine);
		Render.run(this.render);
		Events.on(this.engine, "beforeUpdate", () => {
			this.items.forEach((item) => item.render());
		});
	}
}
