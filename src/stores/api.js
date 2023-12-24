import { create } from 'apisauce';
import { RequestErrorHandlerStore } from '.';
import { MILE_TO_METER } from '../constants/common';

const createApi = (baseURL) => {
    const instance = create({ baseURL, withCredentials: true });

    instance.axiosInstance.interceptors.response.use(null, (error) => {
      const response = error.response;

      if (response.status === 401 && !response.headers['no-redirect']) {
        window.location.href = `${process.env.REACT_APP_OAUTH_LOGIN_URL}?next=${encodeURI(window.location.href)}`;
        return;
      }

      if (response.status === 403) RequestErrorHandlerStore.error(response);
      return error;
    });

    return instance;
};

export const api = createApi(`${process.env.REACT_APP_API_ROOT}`);
export const readonlyApi = createApi(`${process.env.REACT_APP_READONLY_API_ROOT || process.env.REACT_APP_API_ROOT}`);

export const dashboardAPI = createApi(`${process.env.REACT_APP_API_DASHBOARD}`);
export const paymentAPI = createApi(`${process.env.REACT_APP_API_PAYMENT}`);
export const routingAPI = createApi(`${process.env.REACT_APP_API_ROUTING}`);
export const trafficAPI = createApi(`${process.env.REACT_APP_API_TRAFFIC}`);

// 15130888 15146682 15146675 15146221 15145868 15142522 14976984 15136489 15125291

// 15146670, 15146661, 15146653, 15146675, 15146683, 15146722, 15146735, 15145183, 15145180

const defaultVehicle = {
    "capacity": 30,
    "availability": 1,
    "deploy_cost": 12345,
    "loopback_allowed": false,
    "max_assignment_duration": 72000,
    "travel_distance_unit_cost": MILE_TO_METER,
    "max_travel_time": 28800,
    "travel_time_unit_cost": 20,
    "service_time_unit_cost": 20,
    "wait_time_unit_cost": 800,
    "id": 1,
    "name": "Vehicle-1"
}

export const orderShipment = (id, data) => api.post(`/assignments/${id}/reorder-shipments`, data);
export const resetAssignmentOrder = (id, data) => api.post(`/assignments/${id}/reset-sequence-id`, data);
export const sendTrackingLink = (id) => api.post(`/shipments/${id}/sms/tracking_link`);
export const sendSignatureLink = (id) => api.post(`/shipments/${id}/sms/signature_link`);
export const getClientList = (size, page) => api.get(`/clients`, {size, page});

// for frankenroute
export const getBonusConfig = () => api.get(`/assignments/bonus/config`);
export const listShipmentsByField = (field, data) => api.post(`/shipments/list-with-params`, data, {params: {field, detail: true}});
export const getWarehouses = (params) => routingAPI.get(`/warehouses/list`, params);
export const listProblems = (owner_only) => routingAPI.get(`/routing/problems/list`, {type: "FRANKENROUTE", owner_only})
export const getProblem = (id) => routingAPI.get(`/routing/problems/${id}`);
export const getSubProblems = (id) => routingAPI.get(`/routing/problems/${id}/children`);
export const getProblemConfig = (id) => routingAPI.get(`/labels/${id}/config`);
export const createProblem = (params) => routingAPI.post(`/routing/problems/create_custom`, {...params, source: 'frankenroute'}, {params: {validate_shipment: false}});
export const updateProblemStatus = (id, status) => routingAPI.put(`/routing/problems/${id}/status`, status);
export const updateTimeWindow = (id, start, end) => routingAPI.put(`/routing/problems/${id}/timewindow`, [start, end]);
export const clusterZone = (id, shipmentZones) => routingAPI.put(`/routing/problems/${id}/cluster`, shipmentZones);
export const configLabel = (id, params) => routingAPI.post(`/labels/${id}/config`, params);
export const splitZones = (id) => routingAPI.post(`/routing/problems/${id}/calibrate-region`); // will return sub problems
export const addVehicle = (subId, capacity, availability) => routingAPI.put(`/routing/problems/${subId}/vehicles`, [{...defaultVehicle, capacity, availability}]);
export const startRouting = (subId) => routingAPI.post(`/routing/problems/${subId}/reroute`);
export const getSolution = (id) => routingAPI.get(`/routing/solutions/${id}`);
export const selectProblemSolution = (id, keep_label) => routingAPI.post(`/routing/problems/${id}/select-solution`, null, {params: {reset_dropoff_time: true, keep_label}});
export const getSelectedSolution = (id) => routingAPI.get(`/routing/problems/${id}/selected-solution-new`);
export const getSelectedSolutionRoutes = (solutionId) => routingAPI.get(`/routing/solutions/${solutionId}/assignments`);
export const getRoutePricingInfo = (problem_id, departure_date) => routingAPI.post(`/routing/problems/simulation/${problem_id}/recalculate`, null, {params: {departure_date}});
export const updateBonus = (assignmentId, bonus) => api.post(`/assignments/${assignmentId}/bonus`, {bonus, reason: 'Frankenroute bonus', reason_code: 'Frankenroute'});
export const getDriverCrewsAndBookingSessions = (driverId) => api.get(`/drivers/${driverId}/optional-removal-info`);
export const removeDriver = (driverId, params, data) => api.post(`/driver-crews/drivers/${driverId}`, data, { params });
export const getBoundaryFromRegions = (strRegions) => routingAPI.get(`/routing/zones/regions/${strRegions}`)
export const getClientSetting = (clientId) => dashboardAPI.get(`clients/${clientId}/settings`)
export const getLinehauls = (payload) =>  api.get(`/linehauls`, payload);
export const getDestinations = () =>  api.get(`/linehauls/destinations`);
export const getOrigins = () =>  api.get(`/linehauls/origins`);
export const getNotesBillingDisposition = (id) => api.get(`/notes/${id}`);
export const addNoteBillingDisposition = (id, content) => api.post(`/notes/${id}`, content);
export const editNoteBillingDisposition = (id, content) => api.put(`/notes/${id}/edit`, content);
export const getClientSuccessOwner = () => dashboardAPI.get(`/billing-dispositions/client-managements`);
export const getRegionList = () => api.get('/regions');
export const updatePickupEnforce = (bookingSessionId, ticketId, payload) => api.put(`/tickets/booking-sessions/${bookingSessionId}/ticket-book/${ticketId}/pickup-enforce`, payload);
export const getEventTemplate = (targets, owners) => api.get('/event-template', {targets, owners});
export const getShipmentEvent = (id) => api.get(`/events/shipments/${id}?ref=true&rel=true`);
export const assignmentAddShipment = (assignmentId, shipment_id, is_update_timewindow) => api.post(`/assignments/${assignmentId}/add-shipment`, { shipment_id, is_update_timewindow });
export const redeliveryMultiple = (data, is_update_timewindow) => api.post('/redelivery/redelivery/multiple', {data, is_update_timewindow});
export const redeliveryMultipleV2 = (data, is_update_timewindow) => api.post('/redelivery/redelivery/multiple/v2', {data, is_update_timewindow});
export const getEventAssignments = (assignmentId) => api.get(`/events/assignments/${assignmentId}?ref=true`);
export const getTicketBookingSession = (regions) => api.get(`/driver-services/ticket-booking-session/list-by-regions`, {regions});
export const getDirectBookingSession = (regions) => api.get(`/driver-services/direct-booking-session/list-by-regions`, {regions});
export const getBookingInfo = (assignmentId) => api.get(`/assignments/${assignmentId}/booking-info`);
export const getAssignmentInfo = (assignmentId) => api.get(`/assignments/${assignmentId}/info`);
export const saveTicketBooking = (ticketBookingId, bookingSessionId, ids) => api.post(`/booking/ticket-book/${ticketBookingId}?session=${bookingSessionId}`, {ids});
export const saveDirectBooking = (directBookingId, ids) => api.post(`/driver-schedules/${directBookingId}/assignments/all`, {ids})
export const removeSchedule = (announcementId) => api.post(`/driver-announcements/${announcementId}/remove-schedule`)
export const getDriverScheduleSettings = () => api.get(`/driver-schedules/settings`);
export const getAppFeatures = (owners) => api.get(`/app-features/filtered`, {owners})

export const getReport = (id) => api.get(`/reports/uploaded/${id}`);
export const requestReport = (type, payload) => api.get(`/reports/${type}/request-report`, payload);
export const getAssignmentsActive = (driverId) => api.get(`assignments/active/${driverId}`);
export const searchNearestAssignment = (payload) => api.post(`/redelivery/search-nearest-assignment`, payload);
export const getEvents = (eventId, urlParams) => api.get(`/events/${eventId}/all`, urlParams);

export default api;
