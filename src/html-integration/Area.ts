import {World, Mouse, Engine, Render, Runner, Events, Composite, MouseConstraint} from "matter-js";
import BoxItem from "./BoxItem.ts";
import {Walls} from "./Walls.ts";
import {FoodGenerator} from "./FoodGenerator.ts";
import {Duck} from "./Duck.ts";

// Изменять stiffness при коллизии драг объекта с любой из стен
// по дефолту 0.2 должно быть
const DEFAULT_STIFFNESS = 0.1
// const LOWER_STIFFNESS = 0.02

export default class Area {
	engine: Engine;
	render: Render;
	runner: Runner;
	mouseConstraint: MouseConstraint;
	items: BoxItem[];
	container: HTMLElement;
	containerRect: DOMRect;
	walls: Walls;

	duck: Duck;
	foodGenerator: FoodGenerator;

	constructor(container: HTMLElement) {
		this.container = container;
		this.containerRect = container.getBoundingClientRect()

		this.items = []
		this.walls = new Walls(container)

		// engine?
		this.engine = Engine.create({});

		const containerWidth = container.clientWidth;
		const containerHeight = container.clientHeight;

		// create renderer
		this.render = Render.create({
			element: container,
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

		const mouse = Mouse.create(container)
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

		const walls = this.walls.getWalls()

		Composite.add(this.engine.world, [this.mouseConstraint, ...walls]);

		this.duck = new Duck(container, {x: 100, y: 100})
		Composite.add(this.engine.world, this.duck.body);

		this.foodGenerator = new FoodGenerator(container)
		this.foodGenerator.startGenerating((foodNode) => {
			const randomXPosition = Math.random() * this.containerRect.width
			const randomYPosition = (Math.random() * -50) - 20
			const item = new BoxItem(foodNode, {x: randomXPosition, y: randomYPosition})
			this.items.push(item)
			Composite.add(this.engine.world, item.body);
		})
	}

	initEvents() {
		Events.on(this.engine, 'collisionStart', (e) => {
			console.log('e', e.pairs[0])
			const bodyA = e.pairs[0].bodyA
			const bodyB = e.pairs[0].bodyB

			// TODO - fix it
			if(bodyA === this.duck.body) {
				World.remove(this.engine.world, bodyB)
			} else if(bodyB === this.duck.body) {
				World.remove(this.engine.world, bodyA)
			}
		})

		this.container.addEventListener("mouseleave", (e) => {
			this.mouseConstraint.mouse.mouseup(e);
		});

		window.addEventListener('touchmove', (e) => {
			if(this.walls.isIntersectingWalls({x: e.touches[0].clientX, y: e.touches[0].clientY})) {
				this.mouseConstraint.mouse.mouseup(e);
			}
		})
	}

	start() {
		Runner.run(this.runner, this.engine);
		Render.run(this.render);
		Events.on(this.engine, "beforeUpdate", () => {
			this.items.forEach((item) => item.render());
			this.duck.render()
		});
	}
}
