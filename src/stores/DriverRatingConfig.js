import { action } from 'mobx';

export default class DriverRatingConfig {
  constructor(api) {
    this.api = api;
  }

  @action
  listByDriverType(driver_type) {
    return this.api.get(`/driver-rating/config`, {driver_type})
  }

  @action
  getColorConfigRating() {
    return this.api.get(`/driver-rating/color-config`)
  }

  @action
  reloadCachedByDriverID = (driverID) => {
    if(!driverID) return;

    return this.api.get(`/driver-rating/${driverID}/performance`, {bypass_cache: true});
  }
}