import { observable, action, computed } from 'mobx';
import ObjectListStore from "./ObjectList";
import FormStore from "./FormStore";

class SolutionListStore extends ObjectListStore {
  DEFAULT = {
    baseUrl: "/solutions",
    fields: [
      {name: "id", orderField: "id", label: "ID", hightlight: true, toggleOrder: this.toggleOrder},
      {name: "number_of_assignments", orderField: "number_of_assignments", label: "No Of Assignments (all)", toggleOrder: this.toggleOrder},
      {name: "predicted_start_ts", orderField: "predicted_start_ts", label: "Date", toggleOrder: this.toggleOrder},
      {name: "regions", orderField: "regions", label: "Regions", toggleOrder: this.toggleOrder},
      {name: "status", orderField: "status", label: "Status", toggleOrder: this.toggleOrder},
    ],
    filters: {
      page: 1,
      size: 20,
      order_by: "id",
      desc: true
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
}

export default SolutionListStore;
