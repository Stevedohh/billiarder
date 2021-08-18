import Matter, { Vector } from 'matter-js';
const Bodies = Matter.Bodies;
const Events = Matter.Events;
const Body = Matter.Body;


export class Cue {
	constructor(ball, mouseConstraint, onGrowCue) {
		this.ball = ball;
		this.mouseConstraint = mouseConstraint;
		this.onGrowCue = onGrowCue;

		this.body = Bodies.rectangle(this.ball.position.x + 180, this.ball.position.y, 300, 10, {
			collisionFilter: {
				mask: 0,
			},
			render: {
				label: 'Cue',
				fillStyle: '#BA8C63',
			},
		});
		this.isCueRotate = true;
		this.lastMousePosition = null;
		this.velocityForBall = null;
		this.maxCueTranslateRadius = 100;
	}


	translateCue(evt) {
		const mousePosition = evt.mouse.position;

		if (!this.lastMousePosition) {
			this.lastMousePosition = { ...mousePosition };
		}

		const subMouseAndLastMouse = Vector.sub(mousePosition, this.lastMousePosition);
		const lengthMouse = Vector.magnitude(subMouseAndLastMouse);
		const cueAngle = this.body.angle;
		const cueDirection = { x: Math.cos(cueAngle), y: Math.sin(cueAngle) };
		const dotMouseAndCue = Vector.dot(Vector.normalise(subMouseAndLastMouse), cueDirection);
		const vector = Vector.mult(cueDirection, lengthMouse * dotMouseAndCue);

		const ballPosition = this.ball.position;
		const cuePosition = { x: this.body.position.x + vector.x, y: this.body.position.y + vector.y };

		const deltaBallAndCue = Vector.sub(ballPosition, cuePosition);
		const magnBallAndCue = Vector.magnitude(deltaBallAndCue);

		const normalisedDeltaBallAndCue = Vector.normalise(deltaBallAndCue);
		const dotDeltaBallAndCue = Vector.dot(normalisedDeltaBallAndCue, cueDirection) * -1;

		const powerToKick = magnBallAndCue / 2;

		this.velocityForBall = Vector.mult(cueDirection, powerToKick * -1);

		if (magnBallAndCue >= this.maxCueTranslateRadius) {
			this.lastMousePosition = { ...mousePosition };
			return;
		}

		if (dotDeltaBallAndCue <= 0) {
			this.lastMousePosition = { ...mousePosition };
			return;
		}

		Body.translate(this.body, vector);
		this.lastMousePosition = { ...mousePosition };
	}

	rotateCue(evt) {
		if (this.isCueRotate) {
			const mousePosition = evt.mouse.position;
			const subVector = Vector.sub(mousePosition, this.ball.position);
			const length = Vector.magnitude(subVector);
			const cosAlpha = -subVector.x / length;
			let alpha = Math.acos(cosAlpha);

			if (length === 0) {
				return;
			}

			if (subVector.y > 0) {
				alpha *= -1;
			}

			Body.setCentre(this.body, this.ball.position);
			Body.setAngle(this.body, alpha);
		}
	}

	takeCue() {
		this.isCueRotate = false;
		Events.on(this.mouseConstraint, 'mousemove', (evt) => {
			this.translateCue(evt);
		});
	}

	growCue() {
		this.isCueRotate = true;
		this.lastMousePosition = null;
		this.onGrowCue(this.velocityForBall);
		Events.off(this.mouseConstraint, 'mousemove');
	}

	createEvents() {
		console.log('events');
		Events.on(this.mouseConstraint, 'mousemove', (evt) => {
			this.rotateCue(evt);
		});
		Events.on(this.mouseConstraint, 'mouseup', () => {
			this.growCue();
		});
		Events.on(this.mouseConstraint, 'mousedown', () => {
			this.takeCue();
		});
	}

	removeEvents() {
		Events.off(this.mouseConstraint, 'mousemove');
		Events.off(this.mouseConstraint, 'mouseup');
		Events.off(this.mouseConstraint, 'mousedown');
	}
}
