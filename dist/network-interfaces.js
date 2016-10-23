'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var scriptRunner = require('./script-runner.js');

module.exports = function () {
	function NetworkInterface(interfacesFilePath) {
		_classCallCheck(this, NetworkInterface);

		this.interfacesFilePath = interfacesFilePath;
	}

	_createClass(NetworkInterface, [{
		key: 'currentConfig',
		value: function currentConfig(interfaceName) {
			return scriptRunner.read(this.interfacesFilePath, interfaceName);
		}
	}, {
		key: 'setConfig',
		value: function setConfig(interfaceName, settings) {
			return scriptRunner.write(this.interfacesFilePath, interfaceName, settings);
		}
	}]);

	return NetworkInterface;
}();