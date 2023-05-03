import {Mouse, Engine, Render, Runner, Events, Composite, MouseConstraint} from "matter-js";
import GravityBoxItem from "./GravityBoxItem";
import GravityPointer from "./GravityPointer.ts";
import {GravityWalls} from "./GravityWalls.ts";

// Изменять stiffness при коллизии драг объекта с любой из стен
// по дефолту 0.2 должно быть
const DEFAULT_STIFFNESS = 0.1
// const LOWER_STIFFNESS = 0.02

type TOptions = {
	container: HTMLElement;
	items: HTMLElement[];
};
export default class GravityBox {
	engine: Engine;
	render: Render;
	runner: Runner;
	mouseConstraint: MouseConstraint;
	items: GravityBoxItem[];
	stikyItems: GravityBoxItem[];
	container: HTMLElement;
	containerRect: DOMRect;
	gravityPointer: GravityPointer;
	gravityWalls: GravityWalls;

	dragBody: HTMLElement | null;
	isAttracted: boolean;
	targetPosition: { x: number; y: number };

	constructor(options: TOptions) {
		this.isAttracted = false;
		this.targetPosition = { x: 0, y: 0 };
		this.container = options.container;
		this.containerRect = options.container.getBoundingClientRect()

		this.dragBody = null;

		this.gravityWalls = new GravityWalls(options.container)

		this.stikyItems = []
		this.items = options.items.map(
			(item) => new GravityBoxItem({
				container: item
			})
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

		const mouse = Mouse.create(options.container)
		this.mouseConstraint = MouseConstraint.create(
			this.engine,
			{
				mouse: mouse,
				constraint: {
					stiffness: DEFAULT_STIFFNESS,
					render: {
						visible: false,
					},
				},
			}
		);

		const walls = this.gravityWalls.getWalls()

		Composite.add(this.engine.world, [...this.items.map((item) => item.body), this.mouseConstraint, ...walls]);

		this.gravityPointer = new GravityPointer(options.container)
	}

	initEvents() {
		Events.on(this.mouseConstraint, "mousedown", (e) => {
			this.gravityPointer.updatePosition(e.mouse.position)
			this.gravityPointer.setCursorType('gravity')

			this.engine.gravity.scale = 0;
			this.targetPosition.x = e.mouse.position.x;
			this.targetPosition.y = e.mouse.position.y;
			this.isAttracted = true;
		});

		Events.on(this.mouseConstraint, "mousemove", (e) => {
			this.gravityPointer.updatePosition(e.mouse.position)
			if (!this.isAttracted) {
				return;
			}

			this.targetPosition.x = e.mouse.position.x;
			this.targetPosition.y = e.mouse.position.y;
		});

		Events.on(this.mouseConstraint, "mouseup", () => {
			this.gravityPointer.setCursorType('default')

			this.stikyItems = []

			this.engine.gravity.scale = 0.001;
			this.isAttracted = false;
			this.targetPosition.x = 0;
			this.targetPosition.y = 0;
		});

		Events.on(this.engine, "beforeUpdate", () => {
			if (!this.isAttracted) {
				return;
			}

			this.items.forEach((item) => {
				if(this.gravityPointer.isInCursorArea(item.body.position) && !this.stikyItems.includes(item)) {
					// console.log('body', body)

					// Body.setMass(item.body, 0)

					// item.body.gravityScale = 0
					// item.body.ignoreGravity = true;
					// Body.applyForce(item.body, item.body.position, {
					// 	x: -this.engine.world.gravity.x * this.engine.world.gravity.scale * item.body.mass,
					// 	y: -this.engine.world.gravity.y * this.engine.world.gravity.scale * item.body.mass
					// });
					this.stikyItems.push(item)
				}
			});
			this.stikyItems.forEach((body) => {
				body.moveToPosition(this.targetPosition);
			});
		});

		Events.on(this.mouseConstraint, "startdrag", (e) => {
			this.dragBody = e.body;
		});

		Events.on(this.mouseConstraint, "enddrag", () => {
			this.dragBody = null;
		});

		this.container.addEventListener("mouseleave", (e) => {
			this.mouseConstraint.mouse.mouseup(e);
		});

		window.addEventListener('touchmove', (e) => {
			if(this.gravityWalls.isIntersectingWalls({x: e.touches[0].clientX, y: e.touches[0].clientY})) {
				this.mouseConstraint.mouse.mouseup(e);
			}
		})
	}

	start() {
		Runner.run(this.runner, this.engine);
		Render.run(this.render);
		Events.on(this.engine, "beforeUpdate", () => {
			this.items.forEach((item) => item.render());
		});
	}
}
