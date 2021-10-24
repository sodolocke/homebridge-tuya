const BaseAccessory = require('./BaseAccessory');

const CONTACT_SENSOR_OPEN = 'open';
const CONTACT_SENSOR_CLOSE = 'close';

// main code
class ContactSensorAccessory extends BaseAccessory {
    static getCategory(Categories) {
        return Categories.SENSOR;
    }

    constructor(...props) {
        super(...props);
    }

    _registerPlatformAccessory() {
        const {Service} = this.hap;

        this.accessory.addService(Service.ContactSensor, this.device.context.name);

        super._registerPlatformAccessory();
    }

    _registerCharacteristics(dps) {
        const {Service, Characteristic} = this.hap;
        const service = this.accessory.getService(Service.ContactSensor);
        this._checkServiceName(service, this.device.context.name);

console.log("dps for contact", dps);

        // Set the manufacturer string
        this.manufacturer = (this.device.context.manufacturer) ? this.device.context.manufacturer.trim() : '';
        this.dpAction = this._getCustomDP(this.device.context.dpAction) || '1';
        this.dpStatus = this._getCustomDP(this.device.context.dpStatus) || '2';

/*
        const characteristicCurrentDoorState = service.getCharacteristic(Characteristic.CurrentDoorState)
            .updateValue(this._getCurrentDoorState(dps[this.dpStatus]))
            .on('get', this.getCurrentDoorState.bind(this));
*/
    }

}

module.exports = ContactSensorAccessory;
