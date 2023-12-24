import { observable, action, computed } from 'mobx';
import ObjectListStore from "./ObjectList";
import FormStore from "./FormStore";

class DriverCrewListStore extends ObjectListStore {
  DEFAULT = {
    baseUrl: "/driver-crews",
    fields: [
      {name: "name", orderField: "name", label: "Name", hightlight: true, toggleOrder: this.toggleOrder},
      {name: "region", orderField: "region", label: "Region", hightlight: true, toggleOrder: this.toggleOrder},
      {name: "description", label: "Description"},
      {name: "drivers", label: "Drivers"},
      {name: "actions", label: "#"},
    ],
    filters: {
      regions: '',
      order_by: "name",
      desc: false,
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

  SCHEDULE = {
    fields: [
      {name: "name", orderField: "name", label: "Name", hightlight: true, toggleOrder: this.toggleOrder},
      {name: "region", orderField: "region", label: "Region", hightlight: true, toggleOrder: this.toggleOrder},
      {name: "description", label: "Description"},
      {name: "drivers", label: "Drivers"},
    ]
  };

  constructor(api, parent) {
    super(api);
    this.setData(this.DEFAULT);
    if (!parent) {
      this.schedule = new DriverCrewListStore(api, this);
      this.schedule.setType('SCHEDULE');
    }
  }
}

export default DriverCrewListStore;
