import { observable, action, computed } from 'mobx';
import ObjectListStore from "./ObjectList";
import FormStore from "./FormStore";

class DriverPoolStore {
  baseUrl = "/driver-pools";

  @observable driverPool;

  constructor(api) {
    this.api = api;
    this.formStore = new FormStore(this);
  }

  createPool(cb) {
    const data = this.formStore.data;
    this.api.post(this.baseUrl, data)
      .then(response => {
        if (response.status === 200 && cb) {
          cb(response.data)
        }
      })
  }

  editPool(id, cb) {
    const data = this.formStore.data;
    this.api.put(`${this.baseUrl}/${id}`, data)
      .then(response => {
        if (response.status === 200 && cb) {
          cb(response.data)
        }
      })
  }

  getPool(id, cb) {
    this.api.get(`${this.baseUrl}/${id}`)
      .then(response => {
        if (response.status === 200) {
          this.driverPool = response.data;
          if (cb) {
            cb(response.data);
          }
        }
      })
  }

  deletePool(id, cb) {
    this.api.delete(`${this.baseUrl}/${id}`)
      .then(response => {
        if (response.status === 200) {
          if (cb) {
            cb(response.data);
          }
        }
      })
  }

  addDrivers(driverIds, cb) {
    if (driverIds && driverIds.length > 0) {
      this.api.post(`${this.baseUrl}/${this.driverCrew.id}/drivers`, {driver_ids: driverIds})
        .then(response => {
          this.driverCrew = response.data.driver_crew;
          if (cb) {
            cb(response.data);
          }
        })
    }
  }

  removeDriver(driverId, reason, cb) {
    if (driverId) {
      this.api.delete(`${this.baseUrl}/${this.driverCrew.id}/drivers/${driverId}`, {reason})
        .then(response => {
          this.driverCrew = response.data;
          if (cb) {
            cb(response.data);
          }
        })
    }
  }
}

export default DriverPoolStore;