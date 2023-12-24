import ShipmentStore from './Shipment';
import UserStore from './User';
import {api, readonlyApi, dashboardAPI, paymentAPI, trafficAPI, routingAPI} from './api';
import AssignmentStore from './Assignment';
import DriverScheduleStore from './DriverSchedule';
import DriverStore from './Driver';
import DriverRegistrationStore from './DriverRegistration';
import DriverListStore from "./DriverList";
import DriverCrewListStore from "./DriverCrewList";
import DriverCrewStore from "./DriverCrew";

import DriverPoolListStore from "./DriverPoolList";
import DriverPoolStore from "./DriverPool";
import SolutionListStore from "./SolutionList";
import AssignmentListStore from "./AssignmentList";
import ClientStore from './Client';
import Websocket from './Websocket';
import GeocodeAddressListStore from "./GeocodeAddressList";
import DriverAnnouncementStore from "./DriverAnnouncement";
import DriverSuspensionStore from "./DriverSuspension";
import HistoryStore from "./History";
import LookAndFeelStore from './LookAndFeel.js';
import StatsStore from './Stats';
import Logger from './Logger'
import DriverPickupTimeStore from './DriverPickupTime';
import MessengerStore from './Messenger';
import MessengerInStore from './MessengerInStore';
import LocationStore from './Location';
import DspStore from "./DspStore";
import CallCenterStore from "./CallCenter";
import TicketStore from './Ticket';
import BookingStore from './Booking';
import EventStore from './Event';
import AbandonedListStore from "./Abandoned";
import SupportDoashboard from "./SupportDoashboard";
import PaymentStore from "./Payment";
import LyftStore from './Lyft'
import ToastStore from "./Toast";
import AppealStore from "./Appeal";
import EtaStore from './Eta'
import WorkwhileStore from './Workwhile';
import RegionStore from './Region';
import CustomerProfileStore from './CustomerProfile';
import AddressStore from './Address';
import TrafficStore from './Traffic';
import WarehouseStore from './warehouseStore';
import DriverRatingConfig from './DriverRatingConfig';
import DriverProbationStore from './DriverProbation';
import RequestErrorHandler from './RequestHandler';
import Permission from './Permission';

const logger = new Logger();
window.logger = logger;
const ws = new Websocket();
const clientStore = new ClientStore(api);
const driverStore = new DriverStore(api)
const assignmentStore = new AssignmentStore(logger, api, ws, driverStore, clientStore)
const profileStore = new CustomerProfileStore(api);
const shipmentStore = new ShipmentStore(api, assignmentStore)
const messengerStore = new MessengerStore(api, assignmentStore)
const locationStore = new LocationStore(logger, api);
export const RequestErrorHandlerStore = new RequestErrorHandler();

export const stores = {
    logger: window.logger,
    userStore: new UserStore(api),
    shipmentStore,
    assignmentStore,
    driverStore,
    locationStore,
    clientStore,
    profileStore,
    scheduleStore: new DriverScheduleStore(api),
    driverListStore: new DriverListStore(api),
    driverCrewStore: new DriverCrewStore(api),
    driverCrewListStore: new DriverCrewListStore(api),
    driverPoolStore: new DriverPoolStore(api),
    driverPoolListStore: new DriverPoolListStore(api),
    driverRegistrationStore: new DriverRegistrationStore(api),
    solutionListStore: new SolutionListStore(api),
    assignmentListStore: new AssignmentListStore(api),
    geocodeAddressListStore: new GeocodeAddressListStore(api),
    driverAnnouncementStore: new DriverAnnouncementStore(api),
    driverSuspensionStore: new DriverSuspensionStore(api),
    historyStore: new HistoryStore(api),
    statsStore: new StatsStore(readonlyApi),
    lnfStore: new LookAndFeelStore(),
    driverPickupStore: new DriverPickupTimeStore(api),
    messengerStore: messengerStore,
    messengerInStore: new MessengerInStore(api),
    ticketStore: new TicketStore(logger, api, locationStore),
    bookingStore: new BookingStore(logger, api, ws),
    dspStore: new DspStore(api),
    eventStore: new EventStore(api),
    callCenterStore: new CallCenterStore(api),
    abandonedListStore: new AbandonedListStore(api),
    supportDoashboard: new SupportDoashboard(dashboardAPI),
    paymentStore: new PaymentStore(paymentAPI),
    lyftStore: new LyftStore(logger, api),
    toastStore: new ToastStore(api),
    appealStore: new AppealStore(api),
    etaStore: new EtaStore(logger, api),
    wwStore: new WorkwhileStore(api),
    regionStore: new RegionStore(),
    addressStore: new AddressStore(api),
    trafficStore: new TrafficStore(trafficAPI),
    warehouseStore: new WarehouseStore(routingAPI),
    driverRatingConfig: new DriverRatingConfig(api),
    driverProbationStore: new DriverProbationStore(api),
    permissionStore: new Permission(),
    requestErrorHandler: RequestErrorHandlerStore
};
