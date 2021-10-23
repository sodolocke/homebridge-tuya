const BaseAccessory = require('./BaseAccessory');

class TemperatureAccessory extends BaseAccessory {
    static getCategory(Categories) {
        return Categories.TEMPERATURE_SENSOR;
    }

    constructor(...props) {
        super(...props);
/*
        this.defaultDps = {
            'CurrentTemperature': 103,
            'CurrentHumidity':    104,
        }
*/
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

        this.dpCurrentTemperature = '101';
        this.dpCurrentHumidity = '102';

        //this._getCustomDP(this.device.context.dpCurrentTemperature) || '101';
        //this._getCustomDP(this.device.context.dpCurrentHumidity) || '102';


        let temperature = parseFloat(dps[this.dpCurrentTemperature]) / 10;

        const characteristicTemperature = this.accessory.getService(Service.TemperatureSensor);
        const characteristicCurrentTemperature = characteristicTemperature.getCharacteristic(Characteristic.CurrentTemperature)
        .updateValue( temperature )
        .on('get', this.getDividedState.bind(this, this.dpCurrentTemperature, 10));


console.log("Temperature ID", this.dpCurrentTemperature, dps[this.dpCurrentTemperature] / 10);
console.log("dps", dps);
//console.log(this.device.context);

/*
            .getCharacteristic(Characteristic.CurrentTemperature)
            .updateValue(this._getCurrentTemperature(dps[this.getDp('CurrentTemperature')]))
            .on('get', this.getCurrentTemperature.bind(this));
*/

        const characteristicCurrentHumidity = this.accessory.getService(Service.HumiditySensor)
            .getCharacteristic(Characteristic.CurrentRelativeHumidity)
            .updateValue(dps[this.dpCurrentHumidity])
            .on('get', this.getState.bind(this, this.dpCurrentHumidity));

        this.device.on('change', (changes, state) => {

console.log("changes", changes);

/*
            if (changes.hasOwnProperty('Temperature') && this.characteristicHumidity.value !== changes[this.dpCurrentHumidity]) this.characteristicHumidity.updateValue(changes[this.dpCurrentHumidity]);

            if (changes.hasOwnProperty('Humidity') && this.characteristicHumidity.value !== changes[this.dpCurrentHumidity]) this.characteristicHumidity.updateValue(changes[this.dpCurrentHumidity]);
*/


        });
    }

/*
    getCurrentHumidity(callback) {
        this.getState(this.getDp('CurrentHumidity'), (err, dp) => {
            if (err) return callback(err);

            callback(null, this._getCurrentHumidity(dp));
        });
    }

    _getCurrentHumidity(dp) {
        return dp;
    }

    getCurrentTemperature(callback) {
        this.getState(this.getDp('CurrentTemperature'), (err, dp) => {
            if (err) return callback(err);

            callback(null, this._getCurrentTemperature(dp));
        });
    }

    _getCurrentTemperature(dp) {
        return dp;
    }

    getDp(name) {
        return this.device.context['dps' + name] ? this.device.context['dps' + name] : this.defaultDps[name];
    }
*/
}

module.exports = TemperatureAccessory;
