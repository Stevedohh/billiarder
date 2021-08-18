export class Player {
	constructor(id, name) {
		this.id = id;
		this.name = name;
	}

	score = 0;

	incrementScore() {
		this.score++;
	}
}
