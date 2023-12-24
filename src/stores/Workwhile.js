import { observable, action, computed } from 'mobx';
import moment from 'moment';
import _ from 'lodash';

class WorkwhileStore {
    constructor(api) {
        this.api = api;
    }

    @observable activeShifts = null
    @observable positions = []
    @observable locations = []
    @observable errors = {}
    @observable loadingShifts = false;
    @observable currentPage = 1;
    @observable limit = 20;

    @observable currentShiftId = null;
    @observable currentShift = null;
    @observable loadingShift = false;

    @observable loadingLocations = false;
    @observable locations = [];
    @observable warehouseId = '';
    
    @observable linkingDriver = false;

    tokens = {}

    @action
    getActiveShifts(page) {
        this.currentPage = page;
        this.loadingShifts = true;
        return this.api.get(`/external/workwhile/shift?page=${page || 1}&size=${this.limit}` + (this.warehouseId ? `&warehouse=${this.warehouseId}` : ''))
        .then((response) => {
            this.loadingShifts = false
            this.activeShifts = response.data
        })
    }

    @computed
    get searchQuery() {
        let q = {}
        if (this.currentPage > 1) {
            q['page'] = this.currentPage
        }
        if (this.warehouseId) {
            q['warehouse'] =  this.warehouseId
        }
        return q
    }

    @action
    getShift(id) {
        this.currentShiftId = id;
        this.currentShift =  null;
        this.loadingShift = true;
        return this.api.get(`/external/workwhile/shift/${id}/detail`)
        .then((response) => {
            this.loadingShift = false
            if (response.status == 200) {
                this.currentShift = this.processData(response.data)
            }
        })
    }

    @action
    refreshShift() {
        if (!this.currentShiftId) return
        this.loadingShift = true;
        return this.api.get(`/external/workwhile/shift/${this.currentShiftId}/detail`)
        .then((response) => {
            this.loadingShift = false
            if (response.status == 200) {
                this.currentShift = this.processData(response.data)
            }
        })
    }

    processData(shift) {
        let driverMap = {}
        if (shift.drivers) {
            for (let driver of shift.drivers) {
                driverMap[driver.id] =  driver
            }
        }
        for (let w of shift.shift.workItems) {
            if (w.worker && w.worker.internal_id) {
                w.driver = driverMap[w.worker.internal_id]
            }
        }
        return shift;
    }

    @action
    addAssignment(assignmentIds) {
        if (!this.currentShift) return
        this.loadingShift = true
        return this.api.post(`/external/workwhile/shift/${this.currentShift.id}/assignments`, {ids: assignmentIds})
        .then((response) => {
            this.loadingShift = false
            if (response.status == 200) {
                this.currentShift = this.processData(response.data)
                return true;
            }
            return false;
        })
    }

    @action
    updateWorkerNeeded(workerNeeded) {
        if (!this.currentShift) return
        if (this.currentShift.shift.workerNeeded >= workerNeeded) {
            alert('Cannot update worker needed to a number smaller than booked workers');
            return
        }
        this.loadingShift = true
        return this.api.put(`/external/workwhile/shift/${this.currentShift.id}/worker-needed`, workerNeeded)
        .then((response) => {
            this.loadingShift = false
            if (response.status == 200) {
                this.currentShift = this.processData(response.data)
                return true;
            }
            return false;
        })
    }

    @action
    selectWarehouse(warehouse_id) {
        if (warehouse_id !== this.warehouseId) {
            this.warehouseId = warehouse_id
        }
    }

    @action
    getLocations() {
        this.loadingLocations = true;
        const url = `/external/workwhile/locations`
        return this.api.get(url)
        .then((response) => {
            this.loadingLocations = false
            this.locations = response.data
        })
    }

    @action
    linkDriver(workerId, driverId) {
        this.linkingDriver = true
        const url = `/external/workwhile/workers/${workerId}/link`
        return this.api.post(url, driverId).then((response) => {
            this.linkingDriver = false
            if (response.status === 200)
                return response.data
            return null
        })
    }

}

export default WorkwhileStore