import { observable, action, computed } from 'mobx';
import ObjectListStore from "./ObjectList";
import FormStore from "./FormStore";

class DriverCrewStore {
  baseUrl = "/driver-crews";

  @observable driverCrew;
  @observable isSubmitting = false;

  constructor(api) {
    this.api = api;
    this.formStore = new FormStore(this);
  }

  createCrew(payload, cb) {
    this.isSubmitting = true;
    this.api.post(this.baseUrl, payload)
      .then(response => {
        this.isSubmitting = false;
        cb(response)
      })
  }

  editCrew(id, payload, cb) {
    this.isSubmitting = true;
    this.api.put(`${this.baseUrl}/${id}`, payload)
      .then(response => {
        this.isSubmitting = false;
        cb(response)
      })
  }

  getCrew(id, cb) {
    this.api.get(`${this.baseUrl}/${id}`)
      .then(response => {
        if (response.status === 200) {
          this.driverCrew = response.data;
          if (cb) {
            cb(response.data);
          }
        }
      })
  }

  deleteCrew(id, cb) {
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

export default DriverCrewStore;
