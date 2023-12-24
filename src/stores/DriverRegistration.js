import { observable, action, computed } from 'mobx';
import {DRIVER_BACKGROUND_STATUS, DRIVER_REGISTRATION_STATUS} from "../constants/status";

class DriverRegistrationStore {
    constructor(api) {
        this.api = api;

        this.page = 1;
        this.size = 15;
        // this.start = 0;
        // this.end = 0;
    }

    @observable searchResult = null;
    @observable loadingRecords = false;
    @observable manualApproving = false;
    @observable requizing = false;
    @observable resendingBGURL = false;
    @observable query = ''
    @observable statusFilter = null
    @observable stateFilter = null
    @observable areaFilter = null

    @action
    setQuery(q) {
      this.query = q
      this.loadRecords()
    }

    @action
    setRegion(f) {
      this.areaFilter = f
      this.loadRecords()
    }

    @action
    setState(f) {
      this.stateFilter = f
      this.loadRecords()
    }

    @action
    setStatus(f) {
      this.statusFilter = f
      this.loadRecords()
    }

    @computed
    get searchFilter() {
        let filter = {}
        if (this.statusFilter) filter['status'] = this.statusFilter ? [this.statusFilter]: null;
        if (this.stateFilter) filter['state'] = this.stateFilter ? [this.stateFilter]: null;
        if (this.areaFilter) filter['areas'] = this.areaFilter ? [this.areaFilter]: null;
        return {
            page: this.page - 1,
            size: this.size,
            start: this.start,
            end: this.end,
            query: this.query ? this.query : null,
            filter: filter
        }
    }

    // list records
    @action
    loadRecords() {
        this.loadingRecords = true;
        this.recordsRequested = Date.now();
        this.api.put(`/driver-registration`, this.searchFilter, {requested: this.recordsRequested})
            .then(response => {
                if (response.config.requested !== this.recordsRequested)
                    return;
                this.searchResult = this.processResults(response.data); // TODO: manipulate date into proper format
                this.loadingRecords = false;
            }).catch((e) => {
                this.loadingAssignments = false; // TODO: display error
            })
    }

    // FOR SEARCH TAB
    @action
    selectPage(page) {
        this.page = page
        this.loadRecords()
    }

    @action
    sendBackgroundCheck(registration) {
        this.api.put(`/driver-registration/${registration.record.id}/background-check`).then(r => {
            console.log(r.data)
            if (r.data === true) {
                registration.record.status = 'BACKGROUND_SENT'
            }
        })
        // TODO: handle result back
    }

    @action
    manualApprove(registration) {
        this.manualApproving = true;
        this.api.post(`/background_check/manually_approve`, {driver_id: registration.driver.id}).then(r => {
          if (r.status === 200) {
              registration.driver.background_status = DRIVER_BACKGROUND_STATUS.MANUAL_APPROVED;
          }
          this.manualApproving = false;
        })
    }

    @action
    requiz(registration) {
        this.requizing = true;
        this.api.put(`/driver-registration/${registration.record.id}/requiz`).then(r => {
          if (r.status === 200) {
            registration.record.status = DRIVER_REGISTRATION_STATUS.QUIZ_SENT;
          }
          this.requizing = false;
        })
    }

    @action
    resendBackgroundRequestURL(registration) {
        this.resendingBGURL = true;
        this.api.post(`/background_check/${registration.driver.id}/resend_background_request_url`).then(r => {
            if (r.status === 200) {
                registration.driver.background_status = 'PENDING';
            }
            this.resendingBGURL = false;
        })
    }

    processResults(result) {
        result.registrations = result.registrations.filter(r => r.driver).map(r => {
            if (r.quiz && r.quiz.questionnaire) {
                r.quiz.questionnaire = result.questionnaires[r.quiz.questionnaire.id]
            }
            return r
        })
        result.total_pages = Math.ceil(result.count / result.size)
        result.page = result.page + 1
        return result;
    }

    //Todo unfreeze()
    @observable unfrozening = false;
    @action
    unfrozen(driverId = null, cb = () => {}) {
        if(!driverId) return;

        this.unfrozening = true;

        this.api.post(`/background_check/${driverId}/fcra_run`).then(res => {
            if(res.ok || res.status == 204) {
                this.unfrozening = false;
            }

            if(cb) cb(res);
        });
    }

    //Todo unfreeze()
    @observable driverUnfreezening = false;
    @action
    unfreezeDriver(driverId = null, regions = [], cb = () => {}) {
        if(!driverId) return;

        this.unfrozening = true;

        this.api.post(`/background_check/${driverId}/unfreeze`, regions).then(res => {
            if(res.ok || res.status == 204) {
                this.driverUnfreezening = false;
            } else {
                if(res.data.message) {
                    alert(res.data.message);
                }
            }

            if(cb) cb(res);
        });
    }

    //Todo getCoveredRegions
    @observable coveredRegions = [];
    @action
    getCoveredRegions(cb) {
        this.api.get(`/background_check/covered_regions`).then(res => {
            if(res.ok || res.status === 200) {
                this.coveredRegions = res.data;
            }

            if(cb) cb(res);
        });
    }
}

export default DriverRegistrationStore;
