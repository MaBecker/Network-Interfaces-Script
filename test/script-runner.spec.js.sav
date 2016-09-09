'use strict';

const chai = require("chai");
const expect = chai.expect;
const should = chai.should();
const path = require('path');
const fs = require('fs');

const scriptRunner = require('../src/script-runner.js');

const testInterface = `
auto lo
iface lo inet loopback
 
auto eth0 eth1 eth2 eth3
 
iface eth0 inet static
    address 10.0.11.100
    netmask 255.255.255.0
    gateway 10.0.11.1
 
iface eth1 inet manual
    up ifconfig $IFACE 0.0.0.0 up
    down ifconfig $IFACE down
 
iface eth2 inet static
    address 192.168.1.2
    netmask 255.255.255.0
    gateway 192.168.1.254
 
iface eth3 inet dhcp
`;

const testInterfacePath = path.join(__dirname, 'data', 'test_interface');

describe('Scriptrunner', () => {
  beforeEach((done) => {
    fs.writeFile(testInterfacePath, testInterface, done);
  });

  describe('#read()', () => {
    it('should return just dhcp if interface is defined to used dhcp', (done) => {
    	scriptRunner.read(testInterfacePath, 'eth3')
    		.then((interfaceInfo) => {
    			interfaceInfo.mode.should.equal('dhcp');
    			done();
    		});
    });

    it('should return just manual if interface is defined as manual', (done) => {
      scriptRunner.read(testInterfacePath, 'eth1')
        .then((interfaceInfo) => {
          interfaceInfo.mode.should.equal('manual');
          done();
        });
    });

    it('should return the expected address, netmask, and gateway for static entry', (done) => {
      const expectedAddress = '10.0.11.100';
      const expectedNetmask = '255.255.255.0';
      const expectedGateway = '10.0.11.1';

      scriptRunner.read(testInterfacePath, 'eth0')
        .then((interfaceInfo) => {
          interfaceInfo.address.should.equal(expectedAddress);
          interfaceInfo.netmask.should.equal(expectedNetmask);
          interfaceInfo.gateway.should.equal(expectedGateway);
          done();
        });
    });

  });

  describe('#write()', function () {
    const expectedAddress = '99.88.77.100';
    const expectedNetmask = '255.255.0.0';
    const expectedGateway = '192.168.12.1';

    it('should return the written info in the promise resolve', (done) => {
      scriptRunner.read(testInterfacePath, 'eth0')
        .then((interfaceInfo) => {
          scriptRunner.write(testInterfacePath, 'eth0', {
            gateway: expectedGateway,
            netmask: expectedNetmask,
            address: expectedAddress
          }).then((written) => {
            written.address.should.equal(expectedAddress);
            written.netmask.should.equal(expectedNetmask);
            written.gateway.should.equal(expectedGateway);
            done();
          });
        });
    });

    it('should be able to write all fields to a dhcp interface', (done) => {
      scriptRunner.read(testInterfacePath, 'eth3')
        .then((interfaceInfo) => {
          interfaceInfo.mode.should.equal('dhcp');
          scriptRunner.write(testInterfacePath, 'eth3', {
            address: expectedAddress,
            netmask: expectedNetmask,
            gateway: expectedGateway
          }).then((written) => {
            scriptRunner.read(testInterfacePath, 'eth3').then((newContent) => {
              newContent.address.should.equal(expectedAddress);
              newContent.netmask.should.equal(expectedNetmask);
              newContent.gateway.should.equal(expectedGateway);
              done();
            });
          });
        });
    });

    it('should be able to write some fields to a dhcp interface', (done) => {
      scriptRunner.read(testInterfacePath, 'eth3')
        .then((interfaceInfo) => {
          interfaceInfo.mode.should.equal('dhcp');
          scriptRunner.write(testInterfacePath, 'eth3', {
            address: expectedAddress,
            netmask: expectedNetmask
          }).then((written) => {
            scriptRunner.read(testInterfacePath, 'eth3').then((newContent) => {
              newContent.address.should.equal(expectedAddress);
              newContent.netmask.should.equal(expectedNetmask);
              expect(newContent.gateway).be.undefined;
              done();
            });
          });
        });
    });

    it('should be able to write an address to an existing static interface', (done) => {
      let existingInterface;
      scriptRunner.read(testInterfacePath, 'eth0')
        .then((interfaceInfo) => {
          existingInterface = interfaceInfo;
          scriptRunner.write(testInterfacePath, 'eth0', {
            address: expectedAddress
          }).then((written) => {
            scriptRunner.read(testInterfacePath, 'eth0').then((newContent) => {
              newContent.address.should.equal(expectedAddress);
              newContent.netmask.should.equal(existingInterface.netmask);
              newContent.gateway.should.equal(existingInterface.gateway);
              done();
            });
          });
        });
    });

    it('should be able to write a netmask to an existing static interface', (done) => {
      let existingInterface;
      scriptRunner.read(testInterfacePath, 'eth0')
        .then((interfaceInfo) => {
          existingInterface = interfaceInfo;
          scriptRunner.write(testInterfacePath, 'eth0', {
            netmask: expectedNetmask
          }).then((written) => {
            scriptRunner.read(testInterfacePath, 'eth0').then((newContent) => {
              newContent.address.should.equal(existingInterface.address);
              newContent.netmask.should.equal(expectedNetmask);
              newContent.gateway.should.equal(existingInterface.gateway);
              done();
            });
          });
        });
    });

    it('should be able to write a gateway to an existing static interface', (done) => {
      let existingInterface;
      scriptRunner.read(testInterfacePath, 'eth0')
        .then((interfaceInfo) => {
          existingInterface = interfaceInfo;
          scriptRunner.write(testInterfacePath, 'eth0', {
            gateway: expectedGateway
          }).then((written) => {
            scriptRunner.read(testInterfacePath, 'eth0').then((newContent) => {
              newContent.gateway.should.equal(expectedGateway);
              newContent.netmask.should.equal(existingInterface.netmask);
              newContent.address.should.equal(existingInterface.address);
              done();
            });
          });
        });
    });
  });
});