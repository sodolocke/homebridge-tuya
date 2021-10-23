const BaseAccessory = require('./BaseAccessory');

class TemperatureAccessory extends BaseAccessory {
    static getCategory(Categories) {
        return Categories.TEMPERATURE_SENSOR;
    }

    constructor(...props) {
        super(...props);
    }

    _registerPlatformAccessory() {
        const {Service} = this.hap;

        this.accessory.addService(Service.TemperatureSensor, this.device.context.name);
        this.accessory.addService(Service.HumiditySensor, this.device.context.name);

        super._registerPlatformAccessory();
    }

    _registerCharacteristics(dps) {
        const {Service, Characteristic} = this.hap;
        const infoService = this.accessory.getService(Service.AccessoryInformation);
        infoService.getCharacteristic(Characteristic.Manufacturer).updateValue(this.device.context.manufacturer);
        infoService.getCharacteristic(Characteristic.Model).updateValue(this.device.context.model);

        this._getCustomDP(this.device.context.dpCurrentTemperature) || '101';
        this._getCustomDP(this.device.context.dpCurrentHumidity) || '102';

        const characteristicTemperature = this.accessory.getService(Service.TemperatureSensor);
        const characteristicCurrentTemperature = characteristicTemperature.getCharacteristic(Characteristic.CurrentTemperature)
        .updateValue( dps[this.dpCurrentTemperature] / 10 )
        .on('get', this.getDividedState.bind(this, this.dpCurrentTemperature, 10));

        const characteristicCurrentHumidity = this.accessory.getService(Service.HumiditySensor)
            .getCharacteristic(Characteristic.CurrentRelativeHumidity)
            .updateValue(dps[this.dpCurrentHumidity])
            .on('get', this.getState.bind(this, this.dpCurrentHumidity));

        this.device.on('change', (changes, state) => {
console.log("changes", changes);
            if (changes.hasOwnProperty(this.dpCurrentTemperature) ) this.characteristicTemperature.updateValue(changes[this.dpCurrentTemperature]);
            if (changes.hasOwnProperty(this.dpCurrentHumidity)) this.characteristicCurrentHumidity.updateValue(changes[this.dpCurrentHumidity]);
        });
    }
}

module.exports = TemperatureAccessory;
