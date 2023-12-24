import _ from 'lodash';
import moment from 'moment';
import { observable, action } from 'mobx';

import { DEFAULT_DIRECT_BOOKING_COMMUNICATION_TEMPLATE } from '../constants/ticket';

class BookingStore {
  @observable activeSession = null;
  @observable loading = false;
  @observable activeSessions = [];
  @observable zones = [];
  @observable regionsStr = '';
  @observable selectedAssignmentIds = [];
  @observable selectedTicketBookIds = [];
  @observable bookingSessionFormData = { name: '', communication: DEFAULT_DIRECT_BOOKING_COMMUNICATION_TEMPLATE, is_remove_assignment: false };

  constructor(logger, api, ws) {
    this.logger = logger;
    this.api = api;
  }

  @action
  loadActiveSessions() {
    this.api.get('/booking/active').then((r) => {
      this.activeSessions = this.groupSessions(r.data);
    })
  }

  groupSessions(data) {
    let activeSessions = _.sortBy(data, [x => x.target_date]).reverse() || [];
    const today = moment().add(-3, 'hour').startOf('day')
    const past = _.uniq(_.sortBy(activeSessions.map(x => moment(x.target_date)).filter(x => x.isBefore(today)), d => -d.unix())
      .map(m => m.format('dddd MMM DD')))
    const future = _.uniq(_.sortBy(activeSessions.map(x => moment(x.target_date)).filter(x => x.isAfter(today)), d => d.unix())
      .map(m => m.format('dddd MMM DD')))
    const dates = future.concat(past)
    return dates.map(d => Object.assign({date: d}, {
      sessions: data.filter(x => moment(x.target_date).format('dddd MMM DD') === d)
    }))
  }

  @action
  loadSession(id, cb) {
    this.loading = true;
    this.api.get(`/booking/${id.split('_')[1]}/detail`).then((r) => {
      if (r.ok) {
        this.regionsStr = r.data && r.data.session && r.data.session.attributes && r.data.session.attributes.regions || '';
        this.activeSession = this.processBookingSession(r.data);
      } else {
        this.activeSession = null;
        this.regionsStr = ''
      }
      this.getZones()
      this.loading = false;
      if (cb) cb(r);
    })
  }

  @action
  reloadSession(id) {
    if(!this.activeSession || !this.activeSession.session){
      return;
    }

    this.api.get(`/booking/${this.activeSession.session.id}/detail`).then((r) => {
      if (r.ok) {
        this.regionsStr = r.data && r.data.session && r.data.session.attributes && r.data.session.attributes.regions || '';
        this.activeSession = this.processBookingSession(r.data);
      } else {
        this.activeSession = null;
        this.regionsStr = ''
      }
    })
  }

  @action
  removeAssignmentFromSession(bookId, assignmentId, sessionId, callback) {
    this.loading = true;
    this.api.delete(`/booking/ticket-book/TB_${bookId}/assignment/AS_${assignmentId}`, {session: `BS_${sessionId}`}).then((r) => {
      if (r.ok) {
        console.log('removed assignment', assignmentId, bookId)
      }
      this.loading = false;
      if (callback) callback(r);
    })
  }

  @action
  processBookingSession(data) {
    let groupMap = {}
    if (data.session.groups) {
      data.session.groups.forEach(group => {
        groupMap[group.id] = group
      })
    }
    let assignmentMap = {}
    if (data.assignments) {
      data.assignments.forEach(a => {
        assignmentMap[a.id] = a
      })
    }
    if (data.tickets) {
      data.tickets.forEach(a => {
        if (a.item && a.item.startsWith('AS_')) {
          let assignment_id = parseInt(a.item.split('_')[1])
          a.assignment = assignmentMap[assignment_id]
        }
      })
    }
    if (data.books) {
      data.books.forEach(book => {
        if (data.assignments) {
          let assignment_ids = book.items.map(a => parseInt(a.split('_')[1]))
          book.assignments = data.assignments.filter(a => assignment_ids.indexOf(a.id) >= 0)
        }
        let group = groupMap[book.id]
        if (group && data.tickets) {
          let ticket_ids = group.items.map(a => a.split('_')[1])
          book.tickets = data.tickets.filter(a => ticket_ids.indexOf(a.id) >= 0)
        }
      });
    }
    return data
  }

  @action
  sendPickupTime() {
    this.loading = true
    let pickupSession = this.activeSession.session.attributes.pickup_session
    if (pickupSession)
    this.api.post(`/mq/queue/schedule_driver_pickup`, `BS_${pickupSession}`).then((r) => {
      this.loading = false
    })
  }

  @action
  updateMaxReservation(limit) {
    this.loading = true
    return this.api.patch(`/booking/${this.activeSession.session.id}`, {max_reservation: limit}).then((r) => {
      if (r.status == 200) {
        this.activeSession.session = r.data
        this.refreshSession()
      }
      this.loading = false
    })
  }

  @action
  addDrivers(drivers) {
    this.loading = true
    let driver_ids = drivers.split(/[,\n;]/).filter((s) => s).map((s) => parseInt(s))
    return this.api.post(`/booking/${this.activeSession.session.id}/drivers`, {ids: driver_ids}).then((r) => {
      this.loading = false
      this.loadSession(`BS_${this.activeSession.session.id}`)
    })
  }

  @action
  refreshSession() {
    this.loading = true
    this.api.post(`/booking/${this.activeSession.session.id}/refresh`).then((_) => {
      this.loading = false
      this.loadSession(`BS_${this.activeSession.session.id}`)
    })
  }

  @action
  addAssignments(bookId, assignments) {
    this.loading = true
    let assignment_ids = assignments.split(/[,\n;]/).filter((s) => s).map((s) => parseInt(s))
    return this.api.post(`/booking/ticket-book/${bookId}?session=${this.activeSession.session.id}`, {ids: assignment_ids}).then((r) => {
      this.loading = false
      this.loadSession(`BS_${this.activeSession.session.id}`)
      return r;
    })
  }

  @action
  refreshBook(bookId) {
    this.loading = true
    return this.api.post(`/booking/ticket-book/${bookId}/refresh`).then((r) => {
      this.loading = false
      // this.refreshSession()
    })
  }

  @action
  sendMessage(message, toAll, is_promotional) {
    this.loading = true;
    return this.api.post(`/booking/BS_${this.activeSession.session.id}/announce`, message, {
      params: {
        all: toAll,
        is_promotional
      }
    }).then((r) => {
      this.loading = false
    })
  }

  @action
  getEstimateSMS(message, toAll, is_promotional) {
    return this.api.post(`/booking/BS_${this.activeSession.session.id}/announce`, message, {
      params: {
        all: toAll,
        is_promotional,
        get_estimated_cost:true
      }
    })
  }


  @action
  sendTicketGroupMessage(message, book, is_promotional) {
    this.loading = true
    return this.api.post(`/booking/BS_${this.activeSession.session.id}/announce`, message, {
      params: {
        book,
        is_promotional
      }
    }).then((r) => {
      this.loading = false
    })
  }

  @action
  getEstimatedTicketGroupMessage(message, book, is_promotional) {
    return this.api.post(`/booking/BS_${this.activeSession.session.id}/announce`, message, {
      params: {
        book,
        is_promotional,
        get_estimated_cost:true
      }
    })
  }

  @action
  sendTicketHolderMessage(message, holder, is_promotional) {
    this.loading = true
    return this.api.post(`/booking/BS_${this.activeSession.session.id}/announce`, message, {
      params: {
        driver: holder,
        is_promotional
      }
    }).then((r) => {
      this.loading = false
    })
  }

  @action
  addTickets(noOfTicket, sessionId, bookId) {
    return this.api.put(`/tickets/${sessionId}/tickets`, {
        no_of_ticket_by_group: {
          [bookId]: noOfTicket
        }
    }).then(resp => {
      this.refreshSession();
      return resp;
    });
  }

  @action
  refreshAssignments(advanceSessionId) {
    this.loading = true;
    return this.api.post(`/tickets/advance/${advanceSessionId}/assignments`, {}).then(resp => {
      if (resp.ok) {
        this.refreshSession();
      }

      this.loading = false;
      return resp;
    });
  }

  @action
  refreshBookingAssignments(sessionId) {
    this.loading = true;
    return this.api.post(`/tickets/booking-sessions/${sessionId}/refresh`, {}).then(resp => {
      if (resp.ok) {
        this.refreshSession();
      }

      this.loading = false;
      return resp;
    });
  }

  @action
  getCrews(bsId) {
    return this.api.get(`/booking/${bsId.substr(3)}/crews`);
  }

  @action
  searchDriver(bsId, keyword) {
    return this.api.get(`/booking/${bsId}/drivers/search`, {keyword});
  }

  @action
  addCrews(bsId, crewIds) {
    return this.api.put(`/tickets/${bsId}/drivers`, {crew_ids: crewIds});
  }

  @action
  addTicketGroup(sessionId, payload) {
    this.loading = true;
    return this.api.post(`/tickets/booking-sessions/${sessionId}/add-ticket-group`, {
      groups: [
        payload
      ]
    }).then(resp => {
      this.loading = false;
      return resp;
    });
  }

  @action
  updateTicketGroup(sessionId, ticketBookId, payload){
    this.loading = true;
    return this.api.post(`/booking/${sessionId}/ticket-book/${ticketBookId}`, payload).then(resp => {
      this.loading = false;
      return resp;
    });
  }


  @action
  getZones() {
    this.loading = true;
    return this.api.get(`booking/regions/${this.regionsStr}/zones`).then(resp => {
      this.loading = false;
      if(resp.data && (resp.data.code === 404 || resp.data.code === 500)) {
        this.zones = [];
        return;
      }
      this.zones = resp.data
      return resp;
    });
  }

  @action
  filterBookingByRegionZoneDay(zoneId, day) {
    if(!this.regionsStr || !zoneId || !day) return [];
    this.loading = true;
    return this.api.get(`booking/regions/${this.regionsStr}/zones/${zoneId}/weekday/${day}`).then(resp => {
      this.loading = false;
      return resp;
    });
  }

  @action
  updatePromotional(sessionId, is_promotional) {
    this.loading = true;
    return this.api.post(`booking/${sessionId}/announce`, null, {params: {is_promotional}}).then(resp => {
      this.loading = false;
      return resp;
    });
  }

  @action
  setSelectedAssignments(assignmentIds) {
    this.selectedAssignmentIds = assignmentIds;
  }

  @action
  setSelectedTicketBooks(bookIds) {
    this.selectedTicketBookIds = bookIds;
  }

  @action
  setBookingSessionFormData(field, value) {
    this.bookingSessionFormData[field] = value;
  }

  @action
  createBookingSession(data) {
    return this.api.post('driver-schedules/create-from-ticket', data);
  }

  @action
  cleanupBookingSessionFormState() {
    this.selectedAssignmentIds = [];
    this.selectedTicketBookIds = [];
    this.bookingSessionFormData = { name: '', communication: DEFAULT_DIRECT_BOOKING_COMMUNICATION_TEMPLATE, is_remove_assignment: false };
  }
}

export default BookingStore
