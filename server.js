import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuid } from 'uuid';
import { Game } from './core/Game.js';
import { Player } from './core/Player.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: 'http://localhost:3000',
		methods: ['GET', 'POST'],
	},
});

const PORT = process.env.PORT || 2002;
const state = {};
const clientRooms = {};

io.on('connection', (socket) => {
	const clientId = socket.id;

	socket.on('newGame', (name) => {
		const roomId = uuid();
		clientRooms[clientId] = roomId;
		state[roomId] = new Game(io.to(roomId));
		state[roomId].players.push(new Player(clientId, name));

		socket.emit('gameCode', roomId);
		socket.emit('id', socket.id);
		socket.join(roomId);
	});

	socket.on('joinGame', ({ code, name }) => {
		const roomState = state[code];

		clientRooms[socket.id] = code;

		roomState.players.push(new Player(clientId, name));
		socket.emit('id', socket.id);
		socket.join(code);

		roomState.startGame();
	});

	socket.on('kick', (ball) => {
		const roomState = state[clientRooms[socket.id]];
		if (roomState.currentPlayer.id === socket.id && !roomState.isBallsInMotion()) {
			roomState.eventManager.notify('kick', ball);
		}
	});

	console.log(`New client ${clientId}`);

	socket.on('disconnect', () => {
		console.log(`Clients is disconnect ${clientId}`);
	});
});

httpServer.listen(PORT, () => {
	console.log(`Server listen on port ${PORT}`);
});
