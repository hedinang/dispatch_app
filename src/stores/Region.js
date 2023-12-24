import { observable, action } from 'mobx';
import api from './api';
import { REQUEST_STATUS_IDLE, REQUEST_STATUS_LOADING, REQUEST_STATUS_LOADED } from '../constants/common';

class Regions {
  status = REQUEST_STATUS_IDLE;

  @observable regions = [];

  constructor() {}

  @action async getRegions() {
    this.status = REQUEST_STATUS_LOADING;

    api.get('regions').then((response) => {
      if (!response.ok) return this.status = REQUEST_STATUS_LOADED;

      const { data } = response;
      const regions = data.map(({ properties }) => ({
        label: `[${properties.code}] ${properties.display_name}`,
        value: properties.code,
      }));

      this.regions = regions;
      this.status = REQUEST_STATUS_LOADED;
    });
  }

  @action init() {
    if ([REQUEST_STATUS_LOADING, REQUEST_STATUS_LOADED].includes(this.status)) return;

    this.getRegions();
  }
}

export default Regions;
