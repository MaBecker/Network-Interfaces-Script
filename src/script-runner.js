'use strict';

const exec = require('child_process').exec;
const path = require('path');
var Promise = require('promise-polyfill');

const READ_SCRIPT_PATH  = path.join(__dirname, './awk/readInterfaces.awk');
const WRITE_SCRIPT_PATH = path.join(__dirname, './awk/changeInterface.awk');
const DEFAULT_INTERFACE = 'eth0';
const DEFAULT_INTERFACE_FILE_LOCATION = '/etc/network/interfaces';
const ADDRESS_RETURN_ORDER = ['address', 'netmask', 'network', 'gateway', 'powersave'];


const convertArgsForScript = function convertArgsForScript (interfacesFilePath, args) {
  const converted = [interfacesFilePath];

  // The script requires that device be specified as 
  // "dev=<deviceName>" if changing the interface
  converted.push(`dev=${args.device}`);
  delete args.device;

  for (let key in args) {
    converted.push(`${key}=${args[key]}`);
  }

  return converted.join(' ');
}

const formatResult = function formatResult (textResult) {
  const rawResult  = textResult.trim().split(' ');
  const formattedResult = {};

  if (rawResult[0] === 'dhcp' || rawResult[0] === 'manual') {
    formattedResult.mode = rawResult[0];
  } else {
    for (let i = 0; i < rawResult.length; i++) {
      formattedResult[ADDRESS_RETURN_ORDER[i]] = rawResult[i];
    }
  }
console.log(formattedResult);
  return formattedResult;
};

const writeToFile = function writeToFile(filePath, content) {
  return new Promise((resolve, reject) => {
    exec(`echo "${content}" | tee  ${filePath} > /dev/null`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
};

const runScript = function runScript (scriptName, args) {
	return new Promise((resolve, reject) => {
		const child = exec(`awk -f ${scriptName} ${args}`, (error, stdout, stderr) => {
		  if (error) {
		    reject(error);
		  }
      resolve(stdout);
		});
	});
};

const read = function read (interfacesFilePath, interfaceName) {
  interfacesFilePath = interfacesFilePath || DEFAULT_INTERFACE_FILE_LOCATION;
  interfaceName = interfaceName || DEFAULT_INTERFACE;

  return new Promise((resolve, reject) => {
    runScript(READ_SCRIPT_PATH, [interfacesFilePath, `device=${interfaceName}`].join(' '))
      .then((success) => {
        console.log(success);
         resolve(formatResult(success));
      }).catch((error) => {
        reject(error);
      })
  });
  
};

const write = function write (interfacesFilePath, interfaceName, args) {
  interfacesFilePath = interfacesFilePath || DEFAULT_INTERFACE_FILE_LOCATION;
  interfaceName = interfaceName || DEFAULT_INTERFACE;

  return new Promise ((resolve, reject) => {
    args.device = interfaceName;
    const formattedArgs = convertArgsForScript(interfacesFilePath, args);

    runScript(WRITE_SCRIPT_PATH, formattedArgs)
      .then((newText) => {
        writeToFile(interfacesFilePath, newText).then((success) => {
          resolve(args);
        })
        .catch((fileWriteError) => {
          reject(fileWriteError);
        })
      })
      .catch((error) => {
        console.log(`Error running script: ${error}`);
        reject(error);
      });
  });
};

module.exports = {
	read,
	write
};