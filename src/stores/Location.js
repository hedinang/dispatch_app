import { observable, action } from 'mobx';

class LocationStore {
  @observable location = null

  @action
  updateLocation(location) {
    this.location = location
  }

  @action
  getLocation(){
    return this.location
  }

  @observable activeDriver = null
  @observable lastLocation = null

  constructor(logger, api) {
    this.logger = logger;
    this.api = api;
  }

  @action
  setDriver(id) {
    if (id === this.activeDriver) return;

    this.activeDriver = id
    this.lastLocation = null
    if (this.activeDriver) {
      this.loadLocation();
      if (!this.timer) {
        this.timer = setInterval(() => this.loadLocation(), 10000)
      }
    } else {
      if (this.timer)
        clearInterval(this.timer);
    }
  }

  @action
  loadLocation() {
    if (!this.activeDriver) {
      this.lastLocation = null;
      return;
    }
    this.api.get(`/drivers/${this.activeDriver}/last-known-location?past=600000`).then((r) => {
      if (r.status == 200) {
        if (r.data.driver_id === parseInt(this.activeDriver))
          this.lastLocation = r.data
      }
    })  
  }
}

export default LocationStore
