import { observable, action, computed } from 'mobx';
import ObjectListStore from "./ObjectList";
import FormStore from "./FormStore";

class DriverAnnouncementStore extends ObjectListStore {
  DEFAULT = {
    baseUrl: "/driver-announcements",
    fields: [
      {name: "name", label: "Name", hightlight: true, toggleOrder: this.toggleOrder},
      {name: "media_type", label: "Type"},
      {name: "description", label: "Description"},
      {name: "status", label: "Status"},
      {name: "drivers", label: "Drivers"},
      {name: "actions", label: "#"},
    ],
    filters: {
      order_by: "created_ts",
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
    this.formStore = new FormStore(this);
  }

  @observable driverAnnouncement;
  @observable loadingAnnouncement;

  create(cb) {
    const data = this.formStore.data;
    this.api.post(this.baseUrl, data)
      .then(response => {
        if (response.status === 200 && cb) {
          cb(response.data)
        }
      })
  }

  edit(id, cb) {
    const data = this.formStore.data;
    this.api.put(`${this.baseUrl}/${id}`, data)
      .then(response => {
        if (response.status === 200 && cb) {
          cb(response.data)
        }
      })
  }

  get(id, cb) {
    this.loadingAnnouncement = true
    this.api.get(`${this.baseUrl}/${id}`)
      .then(response => {
        if (response.status === 200) {
          this.driverAnnouncement = response.data;
          if (cb) {
            cb(response.data);
          }
        }
        this.loadingAnnouncement = false
      })
  }

  update(ann, cb) {
    const data  = Object.assign(ann, { driver_ids: [] })
    this.api.put(`${this.baseUrl}/${ann.id}`, {...this.driverAnnouncement, ...data}).then(res => { if(cb) cb(res)})
  }

  delete(id, cb) {
    this.api.delete(`${this.baseUrl}/${id}`)
      .then(response => {
        if (response.status === 200) {
          if (cb) {
            cb(response.data);
          }
        }
      })
  }

  addDrivers(driverIds, cb) {
    if (driverIds && driverIds.length > 0) {
      this.api.post(`${this.baseUrl}/${this.driverAnnouncement.id}/drivers`, {driver_ids: driverIds})
        .then(response => {
          this.driverAnnouncement = response.data;
          if (cb) {
            cb(response.data);
          }
        })
    }
  }

  removeDriver(driverId, cb) {
    if (driverId) {
      this.api.delete(`${this.baseUrl}/${this.driverAnnouncement.id}/drivers/${driverId}`)
        .then(response => {
          this.driverAnnouncement = response.data;
          if (cb) {
            cb(response.data);
          }
        })
    }
  }

  @action
  changeMediaType(mediaType) {
    if (!this.driverAnnouncement) return
    if (mediaType === this.driverAnnouncement.media_type) return
    this.driverAnnouncement.media_type = mediaType
  }

  @action useCrew(annId, screwId, cb) {
    this.api.post(`/driver-announcements/${annId}/driver-crews/${screwId}`)
      .then((response) => {
        if (cb) {
          cb(response.data.drivers);
        }
      })
  }

  @action usePool(annId, id, cb) {
    const poolId = id.split("_")[0];
    const region = id.split("_")[1];
    console.log('id is: ', id, region);
    this.api.post(`/driver-announcements/${annId}/driver-pools/${poolId}/regions/${region}`)
      .then((response) => {
        if (cb) {
          cb(response.data.drivers);
        }
      })
  }

  @action
  sendMessage(aid, payload, cb) {
    return this.api.post(`/driver-announcements/${aid}/messages`, payload).then((response) => {
      if (response.data && response.status != 417) {
        this.driverAnnouncement = response.data;
      }
      if (cb) {
        cb(response);
      }
    })
  }

  @action
  getEstimatedSMS(aid, message, cb) {
    return this.api.post(`/driver-announcements/${aid}/messages/estimated_cost`, {txt: message}).then((response) => {
      if (cb) {
        cb(response);
      }
    })
  }

  @action removeDrivers(announcementId, cb) {
    this.api.delete(`/driver-announcements/${announcementId}/drivers`)
      .then((response) => {
        this.driverAnnouncement.drivers = [];
        if (cb) {
          cb(response);
        }
      })
  }

  @action
  updateAnnouncementStore(newData) {
    this.driverAnnouncement = newData;
  }

  @action
  updateFilters(type, filters) {
    this[type] = {
      ...this[type],
      filters,
    }
  }
}

export default DriverAnnouncementStore;
