import { observable, action, toJS } from 'mobx';
import ObjectListStore from "./ObjectList";

class AssignmentListStore extends ObjectListStore {
  DEFAULT = {
    baseUrl: "/solutions/id/assignments",
    fields: [
      {name: "id", orderField: "id", label: "ID", hightlight: true, toggleOrder: this.toggleStaticOrder},
      {name: "shipment_count", orderField: "shipment_count", label: "NO OF SHIPMENT", hightlight: true, toggleOrder: this.toggleStaticOrder},
      {name: "label", orderField: "label", label: "LABEL", toggleOrder: this.toggleStaticOrder},
      {name: "zones", label: "ZONES"},
      {name: "driver_id", label: "DRIVER"},
      {name: "tour_cost", label: "COST"},
    ],
    filters: {
      order_by: "name",
      desc: false
    },
    result: {
      count: 0,
      items: [],
      total_pages: 0
    },
    listField: "assignments",
    idField: "id",
    processResult: (data, store) => {
      const assignments = data.assignments.filter(a => !a.driver_id);
      // process label
      // let labelMap = {};
      // data.labels.forEach(l => {
      //   labelMap[l.assignment_id] = l;
      // });

      assignments.forEach(a => {
        // a.label = labelMap[a.id] && labelMap[a.id].prefix ? labelMap[a.id].prefix : '';
        if (a.zones) {
          a.zones = a.zones.replace(',', ', ')
          // a.zones = region_name(a.zones)
        }
      });

      store.result = {
        items: assignments,
        count: assignments.length,
        total_pages: 0
      };

      store.orignalResult = {
        items: assignments,
        count: assignments.length,
        total_pages: 0
      };

      this.toggleStaticOrder("label")();

      store.static_filters = {};
    }
  };

  SCHEDULE = {
    fields: [
      {name: "id", orderField: "id", label: "ID", hightlight: true, toggleOrder: this.toggleStaticOrder},
      {name: "label", orderField: "label", label: "INFO", toggleOrder: this.toggleStaticOrder},
      {name: "zones", label: "ZONES"},
      {name: "driver_id", label: "DRIVER"},
      {name: "tour_cost", label: "COST", orderField: "tour_cost", toggleOrder: this.toggleStaticOrder},
      {name: "bonus", label: "BONUS", orderField: "bonus", toggleOrder: this.toggleStaticOrder},
      {name: "actions", label: ""}
    ],
    filters: {},
    processResult: (data, store) => {
      const assignments = data.assignments || data.info.map(a => a.assignment);
      // process label
      // let labelMap = {};
      // data.labels.forEach(l => {
      //   labelMap[l.assignment_id] = l;
      // });

      assignments.forEach(a => {
        // a.label = labelMap[a.id] && labelMap[a.id].prefix ? labelMap[a.id].prefix : '';
        if (a.zones) {
          a.zones = a.zones.replace(',', ', ')
          // a.zones = region_name(a.zones)
        }
      });

      store.result = {
        items: assignments,
        count: assignments.length,
        total_pages: 0
      };

      store.orignalResult = {
        items: assignments,
        count: assignments.length,
        total_pages: 0
      };

      store.static_filters = {};
    }
  };

  @observable static_filters = {};

  constructor(api, parent) {
    super(api);
    this.setData(this.DEFAULT);
    if (!parent) {
      this.schedule = new AssignmentListStore(api, this);
      this.schedule.setType('SCHEDULE');
    }
  }

  @action setStaticFilter = (name) => (e) => {
    if (e.target.value && e.target.value.trim() !== "") {
      this.static_filters[name] = e.target.value.trim().toUpperCase();
    } else {
      delete this.static_filters[name];
    }

    this.filter();
  };

  @action filter() {
    const origResult = toJS(this.orignalResult);
    let items = origResult.items;

    if (this.static_filters.prefix) {
      const re = new RegExp('^' + this.static_filters.prefix + '(.*)[A-Z]{2}$');
      items = items
        .filter(a => a.label.match(re))
    }

    if (this.static_filters.from) {
      items = items
        .filter(a => a.label.slice(-2) >= this.static_filters.from)
    }

    if (this.static_filters.to) {
      items = items
        .filter(a => a.label.slice(-2) <= this.static_filters.to)
    }

    this.result.items = items;
    this.result.count = items.length;
  }
}

export default AssignmentListStore;
