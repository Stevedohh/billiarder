import Matters from 'matter-js';
import { tableHeight, tableWidth } from './constants.js';

const Body = Matters.Body;
const Bodies = Matters.Bodies;

const borderOptions = {
	isStatic: true,
	render: {
		fillStyle: '#5AA02C',
	},
};

export const createBorders = () => {
	const topLeftTrap = Bodies.trapezoid(tableWidth / 4 + 17, 39, 660, 22, -0.09, borderOptions);
	const topRightTrap = Bodies.trapezoid(tableWidth - 416, 39, 660, 22, -0.09, borderOptions);

	const leftTrap = Bodies.trapezoid(44, tableHeight / 2, 683, 29, 0.06, borderOptions);
	Body.rotate(leftTrap, Math.PI / 2);
	const rightTrap = Bodies.trapezoid(tableWidth - 44, tableHeight / 2, 683, 29, 0.06, borderOptions);
	Body.rotate(rightTrap, -Math.PI / 2);

	const bottomRightTrap = Bodies.trapezoid(tableWidth - 416, tableHeight - 39, 720, 22, 0.09, borderOptions);
	const bottomLeftTrap = Bodies.trapezoid(tableWidth / 4 + 17, tableHeight - 39, 720, 22, 0.09, borderOptions);

	return [topLeftTrap, topRightTrap, leftTrap, rightTrap, bottomRightTrap, bottomLeftTrap];
};
