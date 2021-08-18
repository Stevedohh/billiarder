import Matter from 'matter-js';
const Bodies = Matter.Bodies;

const tableOptions = {
	isStatic: true,
	render: {
		fillStyle: '#A05A2C',
	},
};

export const createTable = (tableWidth, tableHeight) => {
	const rightWall = Bodies.rectangle(tableWidth, tableHeight / 2, 60, tableHeight, tableOptions);
	const bottomWall = Bodies.rectangle(tableHeight, tableHeight, tableWidth, 60, tableOptions);
	const topWall = Bodies.rectangle(tableHeight, 0, tableWidth, 60, tableOptions);
	const leftWall = Bodies.rectangle(0, tableHeight / 2, 60, tableHeight, tableOptions);

	return [rightWall, bottomWall, topWall, leftWall];
};
