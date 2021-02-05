const {
	Extension,
	log,
	INPUT_METHOD,
	PLATFORMS,
} = require('deckboard-kit');
const { playSound, getSoundList } = require('./soundpad');

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
				input: [
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
					}
				]
			}
		];
	}

	// Executes when the extensions loaded every time the app start.
	async initExtension() {
		try {
			const items = await getSoundList();
			this.inputs = this.setItems(items);
		} catch (err) {
			log.error(`soundpad:initExtension ${err}`);
		}
	}

	async execute(action, args) {
		try {
			switch (action) {
				case 'soundpad-play':
					let renderLine, captureLine;
					switch (args.playon) {
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

					playSound(args.index, renderLine, captureLine);
					break;
				default:
					break;
			}
		} catch (err) {
			log.error(`soundpad:execute ${err}`)
		}
	};
}

module.exports = sendData => new Soundpad(sendData);
