import * as Matter from 'matter-js';
import { createPockets } from '../core/Pockets';
import { createBorders } from '../core/Borders';
import { createBalls, getBall } from '../core/Balls';
import { createTable } from '../core/Table';
const Engine = Matter.Engine;
const Render = Matter.Render;
const Runner = Matter.Runner;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Composite = Matter.Composite;
const Events = Matter.Events;
const Mouse = Matter.Mouse;
const Vector = Matter.Vector;
const MouseConstraint = Matter.MouseConstraint;
const engine = Engine.create({
	gravity: {
		scale: 0,
		y: 0,
	},
});

const world = engine.world;

const tableWidth = 1600;
const tableHeight = 800;

const render = Render.create({
	element: document.body,
	engine: engine,
	options: {
		width: tableWidth,
		height: tableHeight,
		wireframes: false,
		background: '#0A8030',

	},
});


const walls = createTable(tableWidth, tableHeight);
Composite.add(world, walls);

const pockets = createPockets();
Composite.add(world, pockets);

const borders = createBorders();
Composite.add(world, borders);

const balls = createBalls();
Composite.add(world, balls);

const yellowBall = getBall(balls, 'Yellow ball');

const cue = Bodies.rectangle(yellowBall.position.x + 275, yellowBall.position.y, 500, 10, {
	collisionFilter: {
		mask: 0,
	},
	render: {
		fillStyle: '#BA8C63',
	},
});

// Composite.add(world, [cue]);

const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
	mouse,
	constraint: {
		stiffness: 0,
		render: {
			visible: true,
		},
	},
});

let isCueRotate = true;

Events.on(mouseConstraint, 'mousemove', (evt) => {
	if (isCueRotate) {
		const mousePosition = evt.mouse.position;
		const subVector = Vector.sub(mousePosition, yellowBall.position);
		const length = Vector.magnitude(subVector);
		const cosAlpha = -subVector.x / length;
		let alpha = Math.acos(cosAlpha);

		if (length === 0) {
			return;
		}

		if (subVector.y > 0) {
			alpha *= -1;
		}


		Body.setCentre(cue, { x: yellowBall.position.x, y: yellowBall.position.y });
		Body.setAngle(cue, alpha);
	}
});
Composite.add(world, [cue]);

let lastMousePosition = null;
let velocity = null;
let firstCuePosition = null;

const onMouseMove = (evt) => {
	const mousePosition = evt.mouse.position;

	if (!lastMousePosition) {
		lastMousePosition = { ...mousePosition };
	}

	const subMouseAndLastMouse = Vector.sub(mousePosition, lastMousePosition);
	const lengthMouse = Vector.magnitude(subMouseAndLastMouse);
	const cueAngle = cue.angle;
	const cueDirection = { x: Math.cos(cueAngle), y: Math.sin(cueAngle) };
	const dotMouseAndCue = Vector.dot(Vector.normalise(subMouseAndLastMouse), cueDirection);
	const vector = Vector.mult(cueDirection, lengthMouse * dotMouseAndCue);

	const ballPosition = yellowBall.position;
	const cuePosition = { x: cue.position.x + vector.x, y: cue.position.y + vector.y };

	if (!firstCuePosition) {
		firstCuePosition = cuePosition;
	}

	const deltaBallAndCue = Vector.sub(ballPosition, cuePosition);
	const magnBallAndCue = Vector.magnitude(deltaBallAndCue);
	const maxRadius = 100;

	const normalisedDeltaBallAndCue = Vector.normalise(deltaBallAndCue);
	const dotDeltaBallAndCue = Vector.dot(normalisedDeltaBallAndCue, cueDirection) * -1;

	const powerToKick = magnBallAndCue / 2;

	velocity = Vector.mult(cueDirection, powerToKick * -1);

	if (magnBallAndCue >= maxRadius) {
		lastMousePosition = { ...mousePosition };
		return;
	}

	if (dotDeltaBallAndCue <= 0) {
		lastMousePosition = { ...mousePosition };
		return;
	}

	Body.translate(cue, vector);
	lastMousePosition = { ...mousePosition };
};

Events.on(mouseConstraint, 'mouseup', () => {
	isCueRotate = true;
	lastMousePosition = null;
	Body.setPosition(cue, firstCuePosition);
	firstCuePosition = null;
	setTimeout(() => {
		Matter.World.remove(world, cue);
	}, 100);
	Body.setVelocity(yellowBall, velocity);
	Events.off(mouseConstraint, 'mousemove', onMouseMove);
});

Events.on(mouseConstraint, 'mousedown', () => {
	isCueRotate = false;
	Events.on(mouseConstraint, 'mousemove', onMouseMove);
});


Events.on(engine, 'collisionStart', (event) => {
	const pairs = event.source.pairs.list;

	pairs.forEach(({ bodyA, bodyB }) => {
		if (
			!balls.includes(bodyA) &&
				!walls.includes(bodyA) &&
				!borders.includes(bodyA) &&
				bodyA !== yellowBall &&
				bodyB !== yellowBall) {
			Matter.World.remove(world, bodyB);
		}
		if (
			!balls.includes(bodyB) &&
				!walls.includes(bodyB) &&
				!borders.includes(bodyB) &&
				bodyB !== yellowBall &&
				bodyA !== yellowBall) {
			Matter.World.remove(world, bodyA);
		}
	});
});

Composite.add(world, mouseConstraint);

Render.run(render);

const runner = Runner.create();
Runner.run(runner, engine);
