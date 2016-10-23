'use strict';

var exec = require('child_process').exec;
var path = require('path');
var Promise = require('promise-polyfill');

var READ_SCRIPT_PATH = path.join(__dirname, './awk/readInterfaces.awk');
var WRITE_SCRIPT_PATH = path.join(__dirname, './awk/changeInterface.awk');
var DEFAULT_INTERFACE = 'eth0';
var DEFAULT_INTERFACE_FILE_LOCATION = '/etc/network/interfaces';
var ADDRESS_RETURN_ORDER = ['address', 'netmask', 'network', 'gateway', 'powersave'];

var convertArgsForScript = function convertArgsForScript(interfacesFilePath, args) {
  var converted = [interfacesFilePath];

  // The script requires that device be specified as 
  // "dev=<deviceName>" if changing the interface
  converted.push('dev=' + args.device);
  delete args.device;

  for (var key in args) {
    converted.push(key + '=' + args[key]);
  }

  return converted.join(' ');
};

var formatResult = function formatResult(textResult) {
  var rawResult = textResult.trim().split(' ');
  var formattedResult = {};

  if (rawResult[0] === 'dhcp' || rawResult[0] === 'manual') {
    formattedResult.mode = rawResult[0];
  } else {
    for (var i = 0; i < rawResult.length; i++) {
      formattedResult[ADDRESS_RETURN_ORDER[i]] = rawResult[i];
    }
  }
  console.log(formattedResult);
  return formattedResult;
};

var writeToFile = function writeToFile(filePath, content) {
  return new Promise(function (resolve, reject) {
    exec('echo "' + content + '" | tee  ' + filePath + ' > /dev/null', function (error, stdout, stderr) {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
};

var runScript = function runScript(scriptName, args) {
  return new Promise(function (resolve, reject) {
    var child = exec('awk -f ' + scriptName + ' ' + args, function (error, stdout, stderr) {
      if (error) {
        reject(error);
      }
      resolve(stdout);
    });
  });
};

var read = function read(interfacesFilePath, interfaceName) {
  interfacesFilePath = interfacesFilePath || DEFAULT_INTERFACE_FILE_LOCATION;
  interfaceName = interfaceName || DEFAULT_INTERFACE;

  return new Promise(function (resolve, reject) {
    runScript(READ_SCRIPT_PATH, [interfacesFilePath, 'device=' + interfaceName].join(' ')).then(function (success) {
      console.log(success);
      resolve(formatResult(success));
    }).catch(function (error) {
      reject(error);
    });
  });
};

var write = function write(interfacesFilePath, interfaceName, args) {
  interfacesFilePath = interfacesFilePath || DEFAULT_INTERFACE_FILE_LOCATION;
  interfaceName = interfaceName || DEFAULT_INTERFACE;

  return new Promise(function (resolve, reject) {
    args.device = interfaceName;
    var formattedArgs = convertArgsForScript(interfacesFilePath, args);

    runScript(WRITE_SCRIPT_PATH, formattedArgs).then(function (newText) {
      writeToFile(interfacesFilePath, newText).then(function (success) {
        resolve(args);
      }).catch(function (fileWriteError) {
        reject(fileWriteError);
      });
    }).catch(function (error) {
      console.log('Error running script: ' + error);
      reject(error);
    });
  });
};

module.exports = {
  read: read,
  write: write
};