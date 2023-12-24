import {observable, action} from 'mobx';
import _ from 'lodash';

class FormStore {
  @observable data = {};
  @observable error = {};
  @observable errors = [];
  @observable originData = {};

  constructor(parentStore) {
    this.parentStore = parentStore;
  }

  @action
  handlerInput = (event) => {
    if (event.target && event.target.name && event.target.checked) {
      _.set(this.data, event.target.name, event.target.checked);
    } else if (event.target && event.target.name && event.target.value !== undefined) {
      const v = event.target.name.endsWith('variants') ? event.target.value.split(',') : event.target.value;
      _.set(this.data, event.target.name, v);
    }
  };

  @action
  handlerTextarea = (event) => {
    if (event.target && event.target.name && event.target.value !== undefined) {
      const v = event.target.name.endsWith('variants') ? event.target.value.split(',') : event.target.value;
      _.set(this.data, event.target.name, v);
    }
  };

  @action
  handlerCheckbox = (event) => {
    _.set(this.data, event.target.name, event.target.checked);
  };

  @action
  handlerCheckboxes = (event) => {
    const currentValue = this.getField(event.target.name, []);
    if (event.target.checked === true && !currentValue.includes(event.target.value)) {
      currentValue.push(event.target.value);
      _.set(this.data, event.target.name, currentValue);
    } else if (event.target.checked === false && currentValue.includes(event.target.value)) {
      _.remove(currentValue, function(str) {
        return str === event.target.value;
      });

      _.set(this.data, event.target.name, currentValue);
    }
  };

  @action
  handlerRating = (name) => (value) => {
    _.set(this.data, name, value);
    _.set(this.data, 'tags', []);
  };

  @action
  handlerReactSelect = (name) => (option) => {
    this.data[name] = option.value;
  };

  @action
  handlerDateInput = (name) => (date) => {
    this.data[name] = date;
  };

  @action
  handlerTimestamp = (name) => (date) => {
    if (date) {
      this.data[name] = date.getTime();
    }
  };

  getField(name, defaultValue) {
    return _.get(this.data, name, defaultValue);
  }

  arrayContains(name, value) {
    return _.get(this.data, name, []).includes(value);
  }

  setField(name, value) {
    return _.set(this.data, name, value);
  }

  addError(error) {
    this.errors = [error];
  }

  getErrors() {
    return this.errors;
  }

  @action
  handlerRadio = (evt) => {
    _.set(this.data, evt.target.name, [evt.target.value]);
  }

  @action
  rollbackData = () => {
    this.data = _.cloneDeep(this.originData);
  }
}

export default FormStore;
