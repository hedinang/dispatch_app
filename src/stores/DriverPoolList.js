import { observable, action, computed } from 'mobx';
import ObjectListStore from "./ObjectList";
import FormStore from "./FormStore";

class DriverPoolListStore extends ObjectListStore {
  DEFAULT = {
    baseUrl: "/driver-pools",
    fields: [
      {name: "tag", orderField: "tag", label: "Name", hightlight: true, toggleOrder: this.toggleOrder},      
      {name: "region", label: "Region"},
      {name: "description", label: "Description"},
      {name: "no_of_drivers", label: "Drivers"},
      {name: "actions", label: "#"},
    ],
    filters: {
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
      {name: "tag", orderField: "tag", label: "Name", hightlight: true, toggleOrder: this.toggleOrder},      
      {name: "region", label: "Region"},
      {name: "description", label: "Description"},
      {name: "no_of_drivers", label: "Drivers"},
    ]
  };

  constructor(api, parent) {
    super(api);
    this.setData(this.DEFAULT);
    if (!parent) {
      this.schedule = new DriverPoolListStore(api, this);
      this.schedule.setType('SCHEDULE');

      this.announcement = new DriverPoolListStore(api, this);
      this.announcement.setType('SCHEDULE');
    }
  }
}

export default DriverPoolListStore;
