import { observable, action } from 'mobx';
import {ASSIGNMENT_STATUS} from '../constants/status';

class DriverStore {
    constructor(api) {
        this.api = api;
    }

    @observable driverSearchResult = [];
    @observable driverAssignmentFilter = {
      'size': 10,
      'page': 1,
      'status[]': 'COMPLETED',
      'have_stop_statuses': 'true',
    };

    @action
    search(keyword) {
        this.api.get(`/drivers/advanced-search/${keyword}`)
            .then(response => {
                if (response.status === 200) {
                    this.driverSearchResult = response.data;
                }
            })
    }

    @action
    driverSearch(q, cb) {
      if(!q) return false;

      this.api.get(`/drivers/search?page=0&size=20&order_by=id&desc=true&q=${q}`).then(res => {
        console.log(res)
        if(res.status === 200 || res.ok) {}

        if(cb) cb(res);
      });
    }

    @action
    get(id, cb) {
        return this.api.get(`/drivers/${id}`)
            .then(response => {
                if(cb) cb(response);
                if (response.status === 200) {
                    return response.data;
                } else {
                    return null;
                }
            })
    }

    @action
    getExtraInfo(ids, cb) {
      const processedIds = ids.replaceAll(' ', '')
      return this.api.get(`/drivers/${processedIds}/extra-info`)
          .then(response => {
              if(cb) cb(response);
              if (response.status === 200) {
                  return response.data;
              } else {
                  return null;
              }
          })
    }

    getLastLocation(id) {
        return this.api.get(`/drivers/${id}/location`)
            .then(response => {
                if (response.status === 200) {
                    return response.data.length > 0 ? response.data[0] : null;
                } else {
                    return null
                }
            })
    }

  quit(id, query, callback) {
    return this.api.post(`/drivers/${id}/quit`, query).then(callback)
  }

  suspend(id, query, callback) {
    return this.api.post(`/drivers/${id}/suspend`, query).then(callback)
  }

  warning(id, query, callback) {
    return this.api.post(`/drivers/${id}/warning`, query).then(callback)
  }

  reactivate(id, query, callback) {
    return this.api.post(`/drivers/${id}/re-activate`, query).then(callback)
  }

  getSuspensions(driverId) {
    return this.api.get(`/drivers/${driverId}/suspensions`);
  }

  getActiveAssignment(driverId) {
    const status = [];
    const active = true;
    return this.api.get(`/assignments/drivers/${driverId}`, {active});
  }

  getAssignmentHistory(assignmentId) {
    return this.api.get(`/assignments/${assignmentId}/history`);
  }

  getPendingAssignments(driverId) {
    const status = [ASSIGNMENT_STATUS.CREATED, ASSIGNMENT_STATUS.PENDING, ASSIGNMENT_STATUS.NULL, ASSIGNMENT_STATUS.IN_PROGRESS, ''];
    return this.api.get(`/assignments/drivers/${driverId}`, {status, active: false});
  }

  getPastAssignments(driverId, page) {
    const status = [ASSIGNMENT_STATUS.COMPLETED];
    return this.api.get(`/assignments/drivers/${driverId}`, {status, size: 10, page, have_stop_statuses: true});
  }

  getStatistics(driverId) {
    return this.api.get(`/drivers/${driverId}/statistics`);
  }

  checkUnsubscribed(driverId, callback) {
    return this.api.get(`/drivers/${driverId}/is-unsubscribed`).then(response => {
      if (response.ok) {
        if (callback) callback(response);
      }
    });
  }

  @action
  getDriverActivity(driverId, limit = 50, offset = 0) {
    return this.api.get(`/events/drivers/${driverId}?limit=${limit}&offset=${offset}`)
  }
  @action
  getDriverAssignments(driverId, callback) {
    return this.api.get(`/assignments/drivers/${driverId}`, this.driverAssignmentFilter).then(res => {
      console.log(res)
    });
  }

  @action
  getPaymentHistory(query) {
    let params = new URLSearchParams();

    Object.keys(query).map(t => {
      params.append(t, query[t]);
    });

    return this.api.get(`/finance/payments?${params}`)
  }

  @action
  getDueHistory(query) {
    let params = new URLSearchParams();

    Object.keys(query).map(t => {
      params.append(t, query[t]);
    });

    return this.api.get(`/finance/pending_transactions?${params}`);
  }

  getAppealCategoriesByType(type) {
    return this.api.get(`/appeal-category?type=${type}`);
  }

  getAppealCategories() {
    return this.api.get(`/appeals/categories`);
  }

  getEngagedTime({id = null, start = null, end = null}) {
    return this.api.get(`/drivers/${id}/engagement-time/${start}/${end}`);
  }


  getPoints({id = null}) {
      if(!id) return;

      return this.api.get(`/points/drivers/${id}`);
  }

  getEngagedSummary(id = null) {
      if(!id) return;

      return this.api.get(`/points/drivers/${id}/summary`);
  }

  getPointingSystemOverview(id, start, end) {
      if(!id || !start || !end) return;

      return this.api.get(`/points/drivers/${id}/overview?fromDate=${start}&toDate=${end}`);
  }

  getPointingAssignments(id, start, end) {
      if(!id || !start || !end) return;

      return this.api.get(`/points/drivers/${id}/assignments?fromDate=${start}&toDate=${end}`);
  }

  @action
  getPointingAssignmentDetail = (id) => {
      if(!id) return;

      return this.api.get(`points/assignments/${id}/detail`);
  }

  @action
  getPerformanceByDriverID = (driverID) => {
    if(!driverID) return;

    return this.api.get(`/driver-rating/${driverID}/performance`);
  }

  @action
  getDriverInfoV2 = (driverID) => {
    if(!driverID) return;

    return this.api.get(`/driver-services/drivers/${driverID}`);
  }

  @action
  backgroundCheckRunnable = (driverID) => {
    if(!driverID) return;

    return this.api.get(`/driver-services/drivers/${driverID}/background-check/runnable`);
  }

  @action
  updatePersonalInfo = (driverID, payload) => {
    if(!driverID) return;

    return this.api.patch(`/driver-services/drivers/${driverID}/personal-info`, payload);
  }

  @action
  getRegions = () => {
    return this.api.get(`/regions`);
  }

  @action
  getCrewsByRegions = (region) => {
    return this.api.get(`/driver-services/crews/list-by-regions?regions=${region}`);
  }

  @action
  updateChangeRegion = (driverID, payload) => {
    if(!driverID) return;

    return this.api.patch(`/driver-services/drivers/${driverID}/change-regions`, payload);
  }

  @action
  updateDriverLicense = (driverID, payload) => {
    if(!driverID) return;

    return this.api.patch(`/driver-services/drivers/${driverID}/driver-license`, payload);
  }

  @action
  updateDriverVehicle = (driverID, vehicleID, payload) => {
    if(!driverID || !vehicleID) return;

    return this.api.patch(`/driver-services/drivers/${driverID}/driver-vehicle/${vehicleID}`, payload);
  }

  @action
  getEventDriver = (driverID) => {
    if(!driverID) return;

    return this.api.get(`/driver-services/drivers/${driverID}/events`);
  }

  @action
  getCars = (year, make, model, subModel) => {
    if(!year) return;

    return this.api.get(`/driver-services/cars`, null, {params: { year, make, model, subModel}});
  }

  @action
  backgroundCheckRun = (driverID) => {
    if(!driverID) return;

    return this.api.post(`/driver-services/drivers/${driverID}/background-check/run`);
  }

}

export default DriverStore;
