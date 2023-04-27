const { Extension, log, INPUT_METHOD, PLATFORMS } = require('deckboard-kit');
const { playSound, getSoundList, togglePause, stopSound, getPlayStatus } = require('./soundpad');

class Soundpad extends Extension {
	constructor() {
		super();
		this.name = 'Soundpad';
		this.platforms = [PLATFORMS.WINDOWS];
		this.inputs = this.setItems([]);
		this.configs = [];
	}

	setItems(items) {
		return [
			{
				label: 'Play Sound',
				value: 'soundpad-play',
				icon: 'volume-up',
				color: '#bf001d',
				input: items === null
					? [
						{
							label: 'Soundpad is not running!',
							type: 'input:warning',
							refresh: true
						}
					]
					: [
						{
							label: 'Action Value',
							ref: 'index',
							type: INPUT_METHOD.INPUT_SELECT,
							items
						},
						{
							label: 'Play On',
							ref: 'playon',
							type: INPUT_METHOD.INPUT_SELECT,
							items: [
								{
									label: 'Speaker + Microphone',
									value: 1
								},
								{
									label: 'Speaker Only',
									value: 2
								},
								{
									label: 'Microphone Only',
									value: 3
								}
							]
						},
						{
							label: 'Toggle Play',
							ref: 'togglestop',
							type: INPUT_METHOD.INPUT_SELECT,
							items: [
								{
									label: 'Play',
									value: 1
								},
								{
									label: 'Play/Stop',
									value: 2
								}
							]
						}
					]
			},
			{
				label: 'Stop Sound',
				value: 'soundpad-stop',
				icon: 'stop-circle',
				color: '#bf001d',
			},
			{
				label: 'Toggle Sound',
				value: 'soundpad-toggle-pause',
				icon: 'pause-circle',
				color: '#bf001d',
			}
		];
	}

	// Executes when the extensions loaded every time the app start.
	async initExtension() {
		try {
			const items = await getSoundList();
			this.inputs = this.setItems(items);
		} catch(err) {
			log.error(`soundpad:initExtension ${err}`);
			this.inputs = this.setItems(null);
		}
	}

	// Executes everytime the button creation modal pops up.
	async update() {
		return this.initExtension();
	}

	async execute(action, args) {
		try {
			switch(action) {
				case 'soundpad-play':
					let renderLine, captureLine;
					switch(args.playon) {
						case 2:
							renderLine = true;
							captureLine = false;
						case 3:
							renderLine = false;
							captureLine = true;
						default:
							renderLine = true;
							captureLine = true;
					}
					switch(args.togglestop) {
						case 2:
							const status = await getPlayStatus();
							if(status == 'PLAYING') {
								stopSound();
							}
							else{
								playSound(args.index, renderLine, captureLine);
							}
							break;
						default:
							playSound(args.index, renderLine, captureLine);
					}

					
					break;
				case 'soundpad-stop':
					stopSound();
					break;
				case 'soundpad-toggle-pause':
					togglePause();
					break;
				default:
					break;
			}
		} catch(err) {
			log.error(`soundpad:execute ${err}`)
		}
	};
}

module.exports = sendData => new Soundpad(sendData);
