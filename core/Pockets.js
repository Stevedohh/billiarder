import { tableHeight, tableWidth } from './constants.js';
import Matter from 'matter-js';
const Bodies = Matter.Bodies;

const pocketRadius = 24;
const pocketShift = 10;

const pocketOptions = {
	isSensor: true,
	isStatic: true,
	render: {
		fillStyle: '#000000',
	},
};

export const createPockets = () => {
	const topLeftPocket = Bodies.circle(pocketRadius + pocketShift, pocketRadius + pocketShift, pocketRadius, pocketOptions);
	const topCenterPocket = Bodies.circle(tableWidth / 2, pocketRadius + 2, pocketRadius, pocketOptions);
	const topRightPocket = Bodies.circle(tableWidth - pocketRadius - pocketShift, pocketRadius + pocketShift, pocketRadius, pocketOptions);
	const bottomLeftPocket = Bodies.circle(pocketRadius + pocketShift, tableHeight - pocketRadius - pocketShift, pocketRadius, pocketOptions);
	const bottomCenterPocket = Bodies.circle(tableWidth / 2, tableHeight - pocketRadius - 2, pocketRadius, pocketOptions);
	const bottomRightPocket = Bodies.circle(tableWidth - pocketRadius - pocketShift, tableHeight - pocketRadius - pocketShift, pocketRadius, pocketOptions);

	return [topLeftPocket, topCenterPocket, topRightPocket, bottomLeftPocket, bottomCenterPocket, bottomRightPocket];
};


