import { EventManager } from './EventManager.js';
import Matters from 'matter-js';
import { createTable } from './Table.js';
import { createBalls, getBall } from './Balls.js';
import { FPS, tableHeight, tableWidth } from './constants.js';
import { createPockets } from './Pockets.js';
import { createBorders } from './Borders.js';

const { Body, Composite, Engine, Events, World, Runner } = Matters;

const createEngine = (evtManager) => {
	const engine = Engine.create({
		gravity: {
			scale: 0,
			y: 0,
		},
	});

	const world = engine.world;
	const table = createTable(tableWidth, tableHeight);
	const balls = createBalls();
	const pockets = createPockets();
	const borders = createBorders();

	Composite.add(world, table);
	Composite.add(world, balls);
	Composite.add(world, pockets);
	Composite.add(world, borders);

	const yellowBall = getBall(balls, 'Yellow ball');

	Events.on(engine, 'collisionStart', (event) => {
		const pairs = event.source.pairs.list;

		pairs.forEach(({ bodyA, bodyB }) => {
			if (
				!balls.includes(bodyA) &&
					!table.includes(bodyA) &&
					!borders.includes(bodyA) &&
					bodyA !== yellowBall &&
					bodyB !== yellowBall) {
				World.remove(world, bodyB);
				evtManager.notify('goal', bodyB);
			}
			if (
				!balls.includes(bodyB) &&
					!table.includes(bodyB) &&
					!borders.includes(bodyB) &&
					bodyB !== yellowBall &&
					bodyA !== yellowBall) {
				World.remove(world, bodyA);
				evtManager.notify('goal', bodyA);
			}
		});
	});

	return engine;
};

export class Game {
	constructor(socket) {
		this.engine = createEngine(this.eventManager);
		this.socket = socket;
	}

		eventManager = new EventManager()
		players = [];
		currentPlayer = null
		winnerName = null

		getBodyBalls() {
			return Composite.allBodies(this.engine.world).filter((body) => body.render?.label?.includes('ball'));
		}

		onKick(inputBall) {
			const balls = this.getBodyBalls();
			for (let i = 0; i < balls.length; i++) {
				const ball = balls[i];

				if (ball.render.label === inputBall.label) {
					Body.setVelocity(ball, {
						x: inputBall.velocity.x,
						y: inputBall.velocity.y,
					});
				}
			}
		}

		setCurrentPlayer() {
			this.currentPlayer = this.players[Math.round(Math.random())];
		}

		swapCurrentPlayer() {
			this.currentPlayer = this.players.find((player) => player.id !== this.currentPlayer.id);
		}

		isBallsInMotion() {
			const balls = this.getBodyBalls();
			const ballsInMotion = [];
			for (let i = 0; i < balls.length; i++) {
				const ball = balls[i];
				if (ball.speed <= 0.1) {
					ballsInMotion.push(true);
				} else {
					ballsInMotion.push(false);
				}
			}
			return ballsInMotion.includes(false);
		}

		sendBallsPosition() {
			const ballsState = this.getBodyBalls().map((bodyBall) => {
				return { label: bodyBall.render.label, position: bodyBall.position };
			});

			this.socket.emit('updateBalls', ballsState);
		}

		sendGameInfo() {
			this.socket.emit('gameInfo', { currentPlayer: this.currentPlayer.id, players: this.players });
		}

		startGame() {
			console.log('start');
			const runner = Runner.create();
			Runner.run(runner, this.engine);

			this.setCurrentPlayer();
			this.sendGameInfo();

			this.eventManager.subscribe('kick', (ball) => {
				this.onKick(ball);
				const gameInterval = setInterval(() => {
					if (this.isBallsInMotion()) {
						this.sendBallsPosition();
					} else {
						this.sendBallsPosition();
						this.swapCurrentPlayer();
						this.sendGameInfo();
						clearInterval(gameInterval);
					}
				}, 1000 / FPS);
			});

			const goaledBalls = new Set();
			this.eventManager.subscribe('goal', (ball) => {
				if (!goaledBalls.has(ball.render.label)) {
					goaledBalls.add(ball.render.label);
					this.currentPlayer.incrementScore();
					this.socket.emit('deleteBall', ball.render.label);
				}

				this.players.forEach((player) => {
					if (player.score === 8) {
						this.socket.emit('win', player.name);
					}
				});
			});
		}
}
