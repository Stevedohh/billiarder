import { io } from 'socket.io-client';
import {
	Body,
	Composite,
	Engine,
	Mouse,
	MouseConstraint,
	Render,
	Runner,
	World,
} from 'matter-js';
import { createTable } from '../core/Table';
import { createBalls } from '../core/Balls';
import { createPockets } from '../core/Pockets';
import { Cue } from '../core/Cue.js';
import { createBorders } from '../core/Borders';

const socket = io('ws://localhost:2002');

const canvas = document.querySelector('#canvas-wrapper');
const initialScreen = document.querySelector('#initialScreen');
const gameScreen = document.querySelector('#gameScreen');
const turnDisplay = document.querySelector('#turnDisplay');

const newGameWrapper = document.querySelector('#newGame');
const newGameNameInput = document.querySelector('#newGameNameInput');
const newGameBtn = document.querySelector('#newGameBtn');

const joinGameWrapper = document.querySelector('#joinGame');
const joinGameNameInput = document.querySelector('#joinGameNameInput');
const joinGameBtn = document.querySelector('#joinGameBtn');

const score = document.querySelector('#score');
const name = document.querySelector('#name');
const winner = document.querySelector('#winner');

const tableWidth = 1600;
const tableHeight = 800;
const kickPower = 3;
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
let playerId = '';

const initGame = () => {
	initialScreen.style.display = 'none';
	gameScreen.style.display = 'flex';
};

const showJoinGameView = () => {
	newGameWrapper.style.display = 'none';
	joinGameWrapper.style.display = 'flex';
};

const newGame = () => {
	socket.emit('newGame', newGameNameInput.value);
	initGame();
};

const joinGame = () => {
	socket.emit('joinGame', { code, name: joinGameNameInput.value });
	initGame();
};

if (code) {
	showJoinGameView();
}


newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);

const engine = Engine.create({
	gravity: {
		scale: 0,
		y: 0,
	},
});
const world = engine.world;
const render = Render.create({
	element: canvas,
	engine: engine,
	options: {
		width: tableWidth,
		height: tableHeight,
		wireframes: false,
		background: '#0A8030',
	},
});
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
	mouse,
	constraint: {
		stiffness: 0.2,
		render: {
			visible: false,
		},
	},
});

const table = createTable(tableWidth, tableHeight);
const balls = createBalls();
const pockets = createPockets();
const borders = createBorders();

Composite.add(world, table);
Composite.add(world, balls);
Composite.add(world, pockets);
Composite.add(world, borders);

const ballsMap = new Map();

for (let i = 0; i < balls.length; i++) {
	const ball = balls[i];
	ballsMap.set(ball.render.label, ball);
}

const getBody = (label) => {
	return Composite.allBodies(world).find((ball) => ball.render.label === label);
};

const yellowBall = getBody('Yellow ball');


socket.on('updateBalls', (ballsState) => {
	for (let i = 0; i < ballsState.length; i++) {
		const ballState = ballsState[i];
		const ballInWorld = ballsMap.get(ballState.label);
		Body.setPosition(ballInWorld, ballState.position);
	}
});

socket.on('gameCode', (code) => {
	const queryParams = new URLSearchParams(window.location.search);
	queryParams.set('code', code);
	history.replaceState(null, null, '?' + queryParams.toString());
});

socket.on('id', (id) => {
	playerId = id;
});

socket.on('gameInfo', (gameInfo) => {
	gameInfo.players.forEach((playersInfo) => {
		if (playersInfo.id === playerId) {
			name.innerText = 'Your\'s name ' + playersInfo.name;
		}
		if (playersInfo.id === gameInfo.currentPlayer) {
			turnDisplay.innerText = playersInfo.name + ' turn';
		}
	});

	const	cue = new Cue(getBody('Yellow ball'), mouseConstraint, (velocityForBall) => {
		World.remove(world, cue.body);
		cue.removeEvents();
		socket.emit('kick', {
			label: yellowBall.render.label,
			velocity: velocityForBall,
		});
	});

	if (playerId === gameInfo.currentPlayer) {
		Composite.add(world, [cue.body]);
		cue.createEvents();
	}

	score.innerText = `${gameInfo.players[0].name} score: ${gameInfo.players[0].score} ${gameInfo.players[1].name} score: ${gameInfo.players[1].score}`;
});

socket.on('deleteBall', (ballId) => {
	World.remove(world, ballsMap.get(ballId));
});

socket.on('win', (name) => {
	winner.innerText = 'Winner ' + name;
});


Render.run(render);

const runner = Runner.create();
Runner.run(runner, engine);
