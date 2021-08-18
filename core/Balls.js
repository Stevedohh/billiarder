import Matter from 'matter-js';
const Bodies = Matter.Bodies;

const createBall = (x, y, r, label, color = 'white') => {
	const ballOptions = {
		restitution: 0.9,
		frictionAir: 0.025,
		frictionStatic: 0,
		friction: 0.6,
		render: {
			fillStyle: color,
			label: label,
		},
	};

	return Bodies.circle(x, y, r, ballOptions);
};

export const createBalls = () => {
	const balls = [];
	const radius = 18;
	const XStart = 200;
	const XEnd = 340;
	let YStart = 320;
	let YEnd = 480;

	for (let x = XStart; x <= XEnd; x += 31) {
		for (let y = YStart; y <= YEnd; y += 36) {
			balls.push(createBall(x, y, radius, `ball:${x}-${y}`));
		}
		YStart += radius;
		YEnd -= radius;
	}

	const yellowBall = createBall(1200, 400, radius, 'Yellow ball', 'yellow');
	balls.push(yellowBall);

	return balls;
};

export const getBall = (balls, label) => {
	return balls.find((ball) => ball.render.label === label);
};
