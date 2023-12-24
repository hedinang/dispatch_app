import { observable, action, computed, toJS } from 'mobx';
import ObjectListStore from "./ObjectList";
import FormStore from "./FormStore";

class DriverSuspensionStore extends ObjectListStore {
  DEFAULT = {
    baseUrl: "/driver-suspensions",
    fields: [
      {name: "driver_id", orderField: "driver_id", label: "Driver ID", hightlight: true, toggleOrder: this.toggleOrder},
      {name: "driver_name", label: "Driver Name"},
      {name: "reason", label: "Reason"},
      {name: "category", label: "Category"},
      {name: "suspension_type", label: "Probation Type"},
      {name: "start_time", label: "Start Time"},
      {name: "end_time", label: "End Time"},
      {name: "value", label: "Info"},
      {name: "reporter_id", label: "Report By"},
      {name: "reporter_ts", label: "Report At"},
      {name: "actions", label: "#"},
    ],
    filters: {
      order_by: "reporter_ts",
      desc: true,
      page: 1,
      size: 20
    },
    filterReason: '',
    fieldFilterComponents: {
    },
    result: {
      count: 0,
      items: [],
      total_pages: 0
    },
    listField: "items",
    idField: "id"
  };

  SCHEDULE = {
    baseUrl: "/driver-suspensions",
    fields: [
      {name: "driver_id", orderField: "driver_id", label: "Driver ID", hightlight: true, toggleOrder: this.toggleOrder},
      {name: "driver_name", label: "Driver Name"},
      {name: "reason", label: "Reason"},
      {name: "category", label: "Category"},
      {name: "suspension_type", label: "Probation Type"},
      {name: "start_time", label: "Start Time"},
      {name: "end_time", label: "End Time"},
      {name: "value", label: "Info"},
      {name: "reporter_id", label: "Reported By"},
      {name: "reporter_ts", label: "Reported At"},
      {name: "actions", label: "#"},
    ],
    filters: {
      order_by: "reporter_ts",
      desc: true,
      page: 1,
      size: 20
    },
    result: {
      count: 0,
      items: [],
      total_pages: 0
    },
    listField: "items",
    idField: "id"
  };

  constructor(api, parent) {
    super(api);
    this.setData(this.DEFAULT);
    this.formStore = new FormStore(this);
    this.isLoading = false;
    if (!parent) {
      this.schedule = new DriverSuspensionStore(api, this);
      this.schedule.setType('SCHEDULE');
    }
  }

  @observable driverSuspension;

  create(cb) {
    this.isLoading = false;
    const data = this.formStore.data;
    this.api.post(this.baseUrl, data)
      .then(response => {
        if (response.status === 200 && cb) {
          cb(response.data)
        } else {
          const errors = response.data && (response.data.message || response.data.errors)
          if (errors) {
            this.formStore.errors = errors
          }
        }
      })
  }

  edit(id, cb) {
    this.isLoading = true;
    const data = this.formStore.data;
    this.api.put(`${this.baseUrl}/${id}`, data)
      .then(response => {
        if (response.status === 200 && cb) {
          cb(response.data)
          this.isLoading = false;
        } else {
          if (response.data && response.data.message) {
            this.formStore.addError(response.data.message);
          }
        }
      })
  }

  get(id, cb) {
    this.api.get(`${this.baseUrl}/${id}`)
      .then(response => {
        if (response.status === 200) {
          this.driverSuspension = response.data;
          if (cb) {
            cb(response.data);
          }
        }
      })
  }

  delete(id, cb) {
    this.api.delete(`${this.baseUrl}/${id}`).then(response => {
      if (cb) {
        cb(response);
      }
    })
  }

  //Todo list probation email template
  @observable probationLoading = false;
  @observable probationEmails = [];

  listProbationEmailTemplate(type = 'PROBATION', cb = () => {}) {
    this.probationLoading = true;
    const params = new URLSearchParams();
          params.append('type', type);

    this.api.get(`/driver-suspensions/action_emails/templates`, params).then(res => {
      if(res.status === 200 || res.ok) {
        this.probationEmails = res.data;

        this.probationLoading = false;
      }

      if(cb) cb(res);
    });
  }

  //Todo Send probation emails
  @observable probationEmailSending = false;

  sendDisciplinaryEmails(queryParams, cb = () => {}) {
    this.probationEmailSending = true;
    if(!queryParams && (!queryParams.emailTemplateId || !queryParams.ids.length)) {
      this.probationEmailSending = false;
      return;
    }

    this.api.post(`/driver-suspensions/disciplinary_emails/send`, queryParams).then(res => {
      if(res.status === 200 || res.ok) {
        this.probationEmailSending = false;
      }

      if(cb) cb(res);
    });
  }

  processData = (response, cb) => {
    if (response.status === 200) {
      if (this.processResult) {
        this.processResult(response.data, this);
      }
      else {
        if (Array.isArray(response.data)) {
          this.result = {
            items: response.data,
            count: response.data.length,
            total_pages: 1
          }
        } else {
          let result = {
            items: response.data[this.listField],
            count: response.data.count ? response.data.count : response.data[this.listField].length,
            total_pages: response.data.count && this.filters.size ? Math.ceil(response.data.count / this.filters.size) : 1
          }

          this.result = {...response.data, ...result};
        }

        this.result.data = response.data;
      }

      if(cb) cb(response);
    }
  }

  @action
  search = (cb) => {
    this.searching = true;
    this.selectedItems = [];
    const processedFilters = {};
    const filters = toJS(this.filters)
    Object.keys(filters).forEach(key => {
      if (Array.isArray(filters[key]) && filters[key].length == 0) {
        return
      }
      
      if (!!filters[key] !== false) {
        processedFilters[key] = filters[key]
      }
    })

    if (processedFilters.page && processedFilters.page > 0) {
      processedFilters.page = processedFilters.page - 1;
    }

    if (this.type && this.type.toLowerCase() === 'schedule') {
      this.api.get(this.baseUrl, filters)
        .then(response => {
          this.searching = false;
          this.processData(response, cb)
        })
    } else {
      this.api.post('/driver-suspensions/search', processedFilters)
        .then(response => {
          this.searching = false;
          this.processData(response, cb)
        })
    }
  };
}

export default DriverSuspensionStore;
