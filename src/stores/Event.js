import { observable, action, computed } from 'mobx';
import _ from 'lodash'
import moment from 'moment';

class EventStore {
  constructor(api) {
    this.api = api;
  }

  @observable activeObject = null;
  @observable loading = true;
  @observable allEvents = {}

  @action
  loadEvents(uid) {
    this.loading = true;
    this.activeObject = uid;
    this.api.get(`/events/${uid}/all?rel=true`).then((r) => {
      this.loading = false
      this.allEvents[uid] = observable(_.sortBy(r.data, (e) => -e.ts))
    })
  }

  @action
  unloadEvents(uid) {
    this.allEvents[uid] = null
  }

  eventsFor(uid) {
    return this.allEvents[uid]
  }

  buildTree = (events) => {
    let eventMap = {}
    let wrappers = events.map(e => {
        const w = {...e, subs: [], processed: false}
        eventMap[w.id] = w
        return w
    })
    for (let event of wrappers) {
        if (event.origin &&  eventMap[event.origin]) {
            console.log('in tree')
            event.processed = true
            eventMap[event.origin].subs.push(event)
        }
    }
    return wrappers.filter(e => !e.processed)
  }
  addTimeline = (events) => {
    if (!events || events.length < 1) return []
    let date = moment('2010-01-01')
    let timelined = []
    events.forEach (e => {
        const day = moment(e.ts).startOf('day')
        if (day.isAfter(date)) {
            timelined.push({
                'type': 'timeline',
                ts: day
            })
        }
        date = day
        timelined.push(e)
    })
    return timelined
  }
}

export default EventStore