const BaseAccessory = require('./BaseAccessory');

const CONTACT_SENSOR_OPEN = 'open';
const CONTACT_SENSOR_CLOSE = 'close';

// main code
class ContactSensorAccessory extends BaseAccessory {
    static getCategory(Categories) {
        return Categories.CONTACT_SENSOR;
    }

    constructor(...props) {
        super(...props);
    }

    _registerPlatformAccessory() {
        const {Service} = this.hap;

        this.accessory.addService(Service.ContactSensor, this.device.context.name);

        super._registerPlatformAccessory();
    }

    // function to return a ID string for log messages
    _logPrefix() {
        return '[Tuya] ' +
            (this.manufacturer ? this.manufacturer + ' ' : '') + 'Contact Sensor';
    }

    // function to prefix a string ID and always log to console
    _alwaysLog(...args) { console.log(this._logPrefix(), ...args); }

    // function to log to console if debug is on
    _debugLog(...args) {
        if (this.debug) {
            this._alwaysLog(...args);
        }
    }
  }

    _registerCharacteristics(dps) {
        const {Service, Characteristic} = this.hap;
        const service = this.accessory.getService(Service.ContactSensor);
        this._checkServiceName(service, this.device.context.name);

        // set the debug flag
        if (this.device.context.debug) {
            this.debug = true;
        } else {
            this.debug = false;
        }

        // Set the manufacturer string
        if (this.device.context.manufacturer) {
            this.manufacturer = this.device.context.manufacturer.trim();
        } else {
            this.manufacturer = '';
        }
        // set the dpAction and dpStatus values based on the manufacturer

          // the original garage door opener
          this._debugLog(
              '_registerCharacteristics setting dpAction and dpStatus for generic door');
          this.dpAction = this._getCustomDP(this.device.context.dpAction) || '1';
          this.dpStatus = this._getCustomDP(this.device.context.dpStatus) || '2';


        this.currentOpen = Characteristic.CurrentDoorState.OPEN;
        this.currentClosed = Characteristic.CurrentDoorState.CLOSED;
        this.targetOpen = Characteristic.TargetDoorState.OPEN;
        this.targetClosed = Characteristic.TargetDoorState.CLOSED;
        if (!!this.device.context.flipState) {
            this.currentOpen = Characteristic.CurrentDoorState.CLOSED;
            this.currentClosed = Characteristic.CurrentDoorState.OPEN;
            this.targetOpen = Characteristic.TargetDoorState.CLOSED;
            this.targetClosed = Characteristic.TargetDoorState.OPEN;
        }

        const characteristicTargetDoorState = service.getCharacteristic(Characteristic.TargetDoorState)
            .updateValue(this._getTargetDoorState(dps[this.dpStatus]))
            .on('get', this.getTargetDoorState.bind(this))
            .on('set', this.setTargetDoorState.bind(this));

        const characteristicCurrentDoorState = service.getCharacteristic(Characteristic.CurrentDoorState)
            .updateValue(this._getCurrentDoorState(dps[this.dpStatus]))
            .on('get', this.getCurrentDoorState.bind(this));

        this.device.on('change', changes => {
            this._alwaysLog('changed:' + JSON.stringify(changes));

            if (changes.hasOwnProperty(this.dpStatus)) {
                const newCurrentDoorState =
                    this._getCurrentDoorState(changes[this.dpStatus]);
                this._debugLog('on change new and old CurrentDoorState ' +
                    newCurrentDoorState + ' ' +
                    characteristicCurrentDoorState.value);
                this._debugLog('on change old characteristicTargetDoorState ' +
                    characteristicTargetDoorState.value);

                if (newCurrentDoorState == this.currentOpen &&
                    characteristicTargetDoorState.value !== this.targetOpen)
                    characteristicTargetDoorState.updateValue(this.targetOpen);

                if (newCurrentDoorState == this.currentClosed &&
                    characteristicTargetDoorState.value !== this.targetClosed)
                    characteristicTargetDoorState.updateValue(this.targetClosed);

                if (characteristicCurrentDoorState.value !== newCurrentDoorState) characteristicCurrentDoorState.updateValue(newCurrentDoorState);
            }
        });
    }

    getTargetDoorState(callback) {
        this.getState(this.dpStatus, (err, dp) => {
            if (err) return callback(err);

            this._debugLog('getTargetDoorState dp ' + JSON.stringify(dp));

            callback(null, this._getTargetDoorState(dp));
        });
    }

    _getTargetDoorState(dp) {
        this._debugLog('_getTargetDoorState dp ' + JSON.stringify(dp));


            // Generic garage door uses true for the opened status and false for the
            // closed status
            if (dp === true) {
                return this.targetOpen;
            } else if (dp === false) {
                return this.targetClosed;
            } else {
                this._alwaysLog('_getTargetDoorState UNKNOWN STATE ' +
                    JSON.stringify(dp));
            }

    }

    setTargetDoorState(value, callback) {
        var newValue = CONTACT_SENSOR_CLOSE;
        this._debugLog('setTargetDoorState value ' + value + ' targetOpen ' +
            this.targetOpen + ' targetClosed ' + this.targetClosed);


            // Generic garage door uses true for the open action and false for the
            // close action
            switch (value) {
                case this.targetOpen:
                    newValue = true;
                    break;

                case this.targetClosed:
                    newValue = false;
                    break;

                default:
                    this._alwaysLog('setTargetDoorState UNKNOWN STATE ' +
                        JSON.stringify(value));
            }


        this.setState(this.dpAction, newValue, callback);
    }

    getCurrentDoorState(callback) {
        this.getState(this.dpStatus, (err, dpStatusValue) => {
            if (err) return callback(err);

            callback(null, this._getCurrentDoorState(dpStatusValue));
        });
    }

    _getCurrentDoorState(dpStatusValue) {
        this._debugLog('_getCurrentDoorState dpStatusValue ' +
          JSON.stringify(dpStatusValue));


          // Generic garage door uses true for the open status and false for the
          // close status. It doesn't seem to have other values for opening and
          // closing. If the getState() function callback in BaseAccessory.js passed
          // the dps object into this function, we may be able to infer opening and
          // closing from the combined dpStatus and dpAction values. That would
          // require mods to every accessory that used that callback. Not worth it.
          if (dpStatusValue === true) {
              // dpStatus true corresponds to an open door
              return this.currentOpen;
          } else if (dpStatusValue === false) {
              // dpStatus false corresponds to a closed door, so assume "not open"
              return this.currentClosed;
          } else {
              this._alwaysLog('_getCurrentDoorState UNKNOWN STATUS ' +
                  JSON.stringify(dpStatusValue));
          }

    }
}

module.exports = ContactSensorAccessory;
