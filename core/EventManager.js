export class EventManager {
		subscribers = new Map();

		subscribe(event, callback) {
			if (this.subscribers.get(event)) {
				this.subscribers.get(event).push(callback);
			} else {
				this.subscribers.set(event, [callback]);
			}
		}

		notify(event, data) {
				this.subscribers.get(event)?.forEach((callback) => {
					callback(data);
				});
		}
}
