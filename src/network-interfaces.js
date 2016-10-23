'use strict';
const scriptRunner = require('./script-runner.js');

module.exports = class NetworkInterface {
	constructor (interfacesFilePath) {
		this.interfacesFilePath = interfacesFilePath;
	}

	currentConfig (interfaceName) {
		return scriptRunner.read(this.interfacesFilePath, interfaceName);
	}

	setConfig (interfaceName, settings) {
		return scriptRunner.write(this.interfacesFilePath, interfaceName, settings);
	}
}