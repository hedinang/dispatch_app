import { observable, action, computed } from 'mobx';
import moment from 'moment-timezone';
import _ from 'lodash';

const tzByRegion = {
  JFK: 'America/New_York',
  PHX: 'MST', 
}

class DriverPickupTimeStore {
  constructor(api) {
    this.api = api;

  }

  @observable region = null;
  @observable pickupInfo = {}
  @observable startTs  = null;

  @action
  selectRegion(region) {
    this.region = region
    this.loadPickupTime()
  }

  @action
  loadPickupTime() {
    const tz = tzByRegion[this.region] ? tzByRegion[this.region] : 'America/Los_Angeles'
    const now = moment().tz(tz)
    const s = moment().tz(tz).startOf('day').unix()
    this.startTs = now.unix() < (s + 19 * 3600) ? s : (s + 24 * 3600)
    const e = this.startTs + 24 * 3600
    // console.log(now.unix(), s, this.startTs, e)
    this.api.get(`/pickup-slots`, {region: this.region, start: this.startTs, end: e}).then((r) => {
      this.pickupInfo = this.process(r.data)
    })
  }

  @action
  editNote(id, note) {
    return this.api.post(`/pickup-slots/${id}/notes`, {note}).then((r) => {
      if (r.status !== 200) return
      let slots = this.pickupInfo.slots.map(s => {
        if (s.id === id) {
          return Object.assign(s, r.data)
        } else {
          return s
        }
      })
      this.pickupInfo = this.process(Object.assign(this.pickupInfo, {slots}))
    })
  }

  @action
  getBookingInfo(slot) {
    let assignmentsIds = slot.assignments.map(a => a.id).join(",")
    return this.api.get(`/pickup-slots/${slot.id}/booking-info?assignments=${assignmentsIds}`).then((r) => {
      let byAssignment = {}
      r.data.forEach(e => {
        byAssignment[parseInt(e.object.uid.split('_')[1])] = {
          action: e.action,
          time: moment(e.ts).format('hh:mma MMM D ')
        };
      })
      return byAssignment
    }).catch((e) => { return {} })
  }

  @action
  updateETA(id, eta) {
    return this.api.put(`/pickup-slots/${id}/eta`, eta).then((r) => {
      if (r.status !== 200) {
        alert('Issue while updating eta for pickup time slot')
        return
      }
      let slots = this.pickupInfo.slots.map(s => {
        if (s.id === id) {
          return Object.assign(s, r.data)
        } else {
          return s
        }
      })
      this.pickupInfo = this.process(Object.assign(this.pickupInfo, {slots}))
    })
  }

  @action
  sendMessage(id, note) {
    return this.api.post(`/pickup-slots/${id}/message`, {note}).then((r) => {
      if (r.status !== 200) return
      let slots = this.pickupInfo.slots.map(s => {
        if (s.id === id) {
          return Object.assign(s, r.data)
        } else {
          return s
        }
      })
      this.pickupInfo = this.process(Object.assign(this.pickupInfo, {slots}))
    })
  }

  @action
  process(data) {
    let driverMap = {}

    data.drivers.forEach(d => {
      driverMap[d.id] = d
    })

    data.slots.forEach(s => {
      s.driver = driverMap[s.driver_id]
      s.assignments = data.assignments.filter(a => a.driver_id === s.driver_id)
    })

    const registerdDrivers = _.uniq(data.slots.map(s => s.driver_id))
    const unregistered = data.drivers.filter(d => registerdDrivers.indexOf(d.id) < 0)
      .map(driver => {
        return {
          driver: driver,
          driver_id: driver.id,
          slot_id: 'UNREGISTERED',
          assignments: data.assignments.filter(a => a.driver_id === driver.id)
        }
      })

    const slots = data.slots.concat(unregistered)
    let groups = _.sortBy(
      _.uniqBy(
        slots.map(
          s => Object.assign({}, {id: s.slot_id, start: s.start, end: s.end})
        ),
        s => s.id
      ),
      s => s.id
    )

    groups.forEach(g => {
      g.slots = slots.filter(s => s.slot_id === g.id)
    })

    data.groups = groups
    return data
  }
}

export default DriverPickupTimeStore
