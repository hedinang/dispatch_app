import { observable, action } from 'mobx';
import ObjectListStore from "./ObjectList";

class DriverListStore extends ObjectListStore {
  DEFAULT = {
    baseUrl: "/drivers/search",
    fields: [
      {name: "courier_companies", orderField: "courier_companies", label: "Couriers", nowrap: false ,toggleOrder: this.toggleOrder},
      {name: "id", orderField: "id", label: "Driver ID", hightlight: true, toggleOrder: this.toggleOrder},
      {name: "created", orderField: "_created", label: "Created", hightlight: true, toggleOrder: this.toggleOrder},
      {name: "first_name", orderField: "first_name", label: "First Name", nowrap: true, toggleOrder: this.toggleOrder},
      {name: "last_name", orderField: "last_name", label: "Last Name", nowrap: true, toggleOrder: this.toggleOrder},
      {name: "email", label: "Email"},
      {name: "phone_number", label: "Phone"},
      {name: "home_address", label: "Zipcode", nowrap: true},
      {name: "areas", label: "Areas"},
      {name: "status", orderField: "status", label: "Status", nowrap: true ,toggleOrder: this.toggleOrder},
      {name: "background_status", orderField: "background_status", label: "Background Status", toggleOrder: this.toggleOrder},
      {name: "signed", orderField: "signed", label: "Contract Signed", nowrap: true ,toggleOrder: this.toggleOrder},
      {name: "remark", orderField: "remark", label: "Remark", nowrap: false ,toggleOrder: this.toggleOrder},
      {name: "actions", label: "#"},
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
    listField: "drivers",
    idField: "id"
  };

  SCHEDULE = {
    fields: [
      {name: "courier_companies", orderField: "courier_companies", label: "COURIERS", hightlight: true, toggleOrder: this.toggleOrder, width: '116px'},
      {name: "id", orderField: "id", label: "ID", hightlight: true, toggleOrder: this.toggleOrder, width: '40px'},
      {name: "name", orderField: "first_name", label: "NAME", nowrap: true, toggleOrder: this.toggleOrder, width: '78px'},
      {name: "phone_number", label: "PHONE", width: '90px'},
      {name: "vehicle_make", label: "VEHICLE MAKE", width: '160px'},
      {name: "vehicle_model", label: "MODEL", width: '90px'},
      {name: "vehicle_type", label: "CAT", width: '58px'},
      {name: "max_reservation", label: "MAX", width: '64px'},
      {name: "penalty", label: "PENALTY", width: '103px'},
      {name: "crew_names", label: "DRIVER CREWS", width: '150px'},
      {name: "actions", label: "#", width: '31px'},
    ],
    filters: {},
  };

  SCHEDULE_SEARCH = {
    baseUrl: '/drivers/search',
    fields: [
      {name: "courier_companies", orderField: "courier_companies", label: "COURIERS", hightlight: true, toggleOrder: this.toggleOrder},
      {name: "id", orderField: "id", label: "ID", hightlight: true, toggleOrder: this.toggleOrder},
      {name: "name", orderField: "first_name", label: "NAME", nowrap: true, toggleOrder: this.toggleOrder},
      {name: "phone_number", label: "PHONE"},
      {name: "vehicle_make", label: "VEHICLE MAKE"},
      {name: "vehicle_model", label: "MODEL"},
    ],
    filters: {
      page: 1,
      size: 20,
      order_by: "id",
      desc: true
    }
  };

  SCHEDULE_SUSPENSION = {
    baseUrl: '/drivers/search',
    fields: [
      {name: "select", label: "Select", hightlight: true},
      {name: "courier_companies", label: "COURIERS", hightlight: true, toggleOrder: this.toggleOrder},
      {name: "id", orderField: "id", label: "ID", hightlight: true, toggleOrder: this.toggleOrder},
      {name: "name", orderField: "first_name", label: "NAME", nowrap: true, toggleOrder: this.toggleOrder},
      {name: "phone_number", label: "PHONE"}
    ],
    filters: {
      page: 1,
      size: 5,
      order_by: "id",
      desc: true
    }
  };

  CREW = {
    fields: [
      {name: "courier_companies", orderField: "courier_companies", label: "COURIERS", hightlight: true, toggleOrder: this.toggleOrder},
      {name: "id", orderField: "id", label: "ID", hightlight: true, toggleOrder: this.toggleOrder},
      {name: "name", orderField: "first_name", label: "NAME", nowrap: true, toggleOrder: this.toggleOrder},
      {name: "phone_number", label: "PHONE"},
      {name: "status", label: "STATUS"},
      {name: "vehicle_make", label: "VEHICLE MAKE"},
      {name: "vehicle_model", label: "MODEL"},
      {name: "vehicle_type", label: "CAT"},
      {name: "max_reservation", label: "MAX"},
      {name: "penalty", label: "PENALTY"},      
      {name: "actions", label: "#"},
    ],
    filters: {},
  };

  CREW_SEARCH = {
    baseUrl: '/drivers/search',
    fields: [
      {name: "courier_companies", orderField: "courier_companies", label: "COURIERS", hightlight: true, toggleOrder: this.toggleOrder},
      {name: "id", orderField: "id", label: "ID", hightlight: true, toggleOrder: this.toggleOrder},
      {name: "name", orderField: "first_name", label: "NAME", nowrap: true, toggleOrder: this.toggleOrder},
      {name: "status", label: "STATUS"},
      {name: "phone_number", label: "PHONE"},
      {name: "vehicle_make", label: "VEHICLE MAKE"},
      {name: "vehicle_model", label: "MODEL"},
    ],
    filters: {
      page: 1,
      size: 20,
      order_by: "id",
      desc: true
    }
  };

  POOL_SEARCH = {
    baseUrl: '/drivers/search',
    fields: [
      {name: "courier_companies", orderField: "courier_companies", label: "COURIERS", hightlight: true, toggleOrder: this.toggleOrder},
      {name: "id", orderField: "id", label: "ID", hightlight: true, toggleOrder: this.toggleOrder},
      {name: "name", orderField: "first_name", label: "NAME", nowrap: true, toggleOrder: this.toggleOrder},
      {name: "status", label: "STATUS"},
      {name: "phone_number", label: "PHONE"},
      {name: "vehicle_make", label: "VEHICLE MAKE"},
      {name: "vehicle_model", label: "MODEL"},
    ],
    filters: {
      page: 1,
      size: 20,
      order_by: "id",
      desc: true
    }
  };


  constructor(api, parent) {
    super(api);
    this.setData(this.DEFAULT);

    if (!parent) {
      this.schedule = new DriverListStore(this.api, this);
      this.schedule.setType('SCHEDULE');

      this.schedule_search = new DriverListStore(this.api, this);
      this.schedule_search.setType('SCHEDULE_SEARCH');

      this.schedule_suspension = new DriverListStore(this.api, this);
      this.schedule_suspension.setType('SCHEDULE_SUSPENSION');
      

      this.crew = new DriverListStore(this.api, this);
      this.crew.setType('CREW');

      this.crew_search = new DriverListStore(this.api, this);
      this.crew_search.setType('CREW_SEARCH');

      this.pool = new DriverListStore(this.api, this);
      this.pool.setType('CREW'); // can use the same with crew

      this.pool_search = new DriverListStore(this.api, this);
      this.pool_search.setType('POOL_SEARCH');
    }
  }

  @observable exporting = false;
  @observable quitting = false;
  @observable suspending = false;

  @action
  csv(q, successCB) {
    const baseUrl = "/drivers/search/csv";
    const filters = {
      order_by: this.filters.order_by,
      desc: this.filters.desc
    };

    if (this.filters.q && this.filters.q.trim() !== "") {
      filters['q'] = this.filters.q;
    }

    this.exporting = true;
    this.api.get(baseUrl, filters)
      .then(response => {

        if (response.status === 200) {
          successCB(response.data);
        }
        this.exporting = false;
      })
  }

  @action
  updateFilters(type, filters) {
    this[type] = {
      ...this[type],
      filters,
    }
  }
}

export default DriverListStore;
