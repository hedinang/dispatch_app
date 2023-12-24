import { observable, action, toJS } from 'mobx';
import ObjectListStore from "./ObjectList";
import FormStore from "./FormStore";

class DriverProbationStore extends ObjectListStore {
  DEFAULT = {
    baseUrl: "/driver-suspensions",
    fields: [
      {name: "select", label: "Select", hightlight: true},
      {name: "driver_id", orderField: "driver_id", label: "Driver ID", toggleOrder: this.toggleOrder},
      {name: "driver_name", orderField: "driver_name", label: "Driver Name", nowrap: true, toggleOrder: this.toggleOrder},
      {name: "reason", orderField: "reason", label: "Reason", nowrap: true, toggleOrder: this.toggleOrder},
      {name: "category", orderField: "category", label: "Category", nowrap: true, toggleOrder: this.toggleOrder},
      {name: "probation_type", orderField: "probation_type", label: "Probation Type", nowrap: true, toggleOrder: this.toggleOrder},
    ],
    filters: {
      order_by: "reporter_ts",
      desc: true,
      page: 1,
      size: 5
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
  }

  @observable driverCategories = [];

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

    this.api.post('/driver-suspensions/search', processedFilters)
      .then(response => {
        this.searching = false;
        this.processData(response, cb)
      })
  };
}

export default DriverProbationStore;
