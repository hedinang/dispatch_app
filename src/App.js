import React, { Component, Fragment } from 'react';
import './App.css';
import { AxlHeader } from 'axl-reactjs-ui';
import { stores } from './stores/index';
import { Provider, Observer } from 'mobx-react';
import {
  BrowserRouter as Router, Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import DispatchScreen from './screens/Dispatch/index';
import AssignmentDetailScreen from './screens/AssignmentDetail';
import SearchScreen from './screens/Search/index';
import ScheduleScreen from './screens/Schedule/index';
import MainMenu from './MainMenu';
import DriverRegistrationScreen from './screens/DriverRegistration/index';
import DriverListScreen from './screens/Drivers/index';
import DriverPoolScreen from './screens/DriverPool/index';
import DriverCrewScreen from './screens/DriverCrew/index';
import DashboardScreen from './screens/Dashboard/index';
import MainMenuWrapper from './MainMenuWrapper';
import DriverPickupScreen from './screens/DriverPickupTime';
import CallCenterScreen from "./screens/CallCenter";
import GeocodeAddressScreen from "./screens/GeocodeAddress";
import DriverAnnouncementScreen from "./screens/DriverAnnouncement";
import DriverSuspensionScreen from "./screens/DriverSuspension";
import ClientScreen from "./screens/Client";
import MessengerScreen from "./screens/Messenger";
import Firebase, { FirebaseContext } from './components/Firebase';
import TicketBookingScreen from './screens/TicketBooking';
import TicketBookingSessionScreen from './screens/TicketBookingSession';
import CallCenterAbandondedScreen from "./containers/CallCenterAbandoned";
import DriverRenewalScreen from "./screens/DriverRenewal";
import AddRedelivery from "./screens/AddRedelivery";
import ToastScreen from "./screens/Toast";
import {ThemeProvider} from "@material-ui/styles";
import {ToastContainer} from "react-toastify";
import Frankenroute from "./screens/Frankenroute";
import {lightTheme} from "./themes";
import ShipmentScreen from "./screens/Shipment";
import RolesAuthRoute from './components/RolesAuthRoute';
import DriverDetailScreen from './screens/DriverDetailScreen';
import DriverRatingConfig from './containers/DriverRatingConfig';
import RequestErrorHandlerManager from './containers/RequestHandlerManager';
import LinehaulDashboard from './screens/LHDashboard';
import AxlLeftSideMenu from './components/AxlLeftSideMenu';
import AddRedeliveryV2 from './screens/AddRedeliveryV2';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isActive: false,
    }
  }

  componentDidMount() {
    stores.userStore.getUser();
    stores.permissionStore.getPermissionSetting();
  }

  toogleMenuSlider = () => {
    this.setState({isActive: !this.state.isActive})
  }

  closeMenuSlider = () => {
    this.setState({isActive: false})
  }

  logout() {
    window.location.href = `${process.env.REACT_APP_OAUTH_URL}/login?logout=true&next=${encodeURI(window.location.href)}`;
  }

  render() {
    const { isActive, isHideMainMenu } = this.state
    const userScopes = (stores.userStore && stores.userStore.user && stores.userStore.user.scopes) || [];
    const DEFINED = {
      UNKNOWN_DRIVER: 1,
      UNKNOWN_RECIPIENT: 2,
      DRIVER: 8,
      RECIPIENT: 9
    }
    const urlParams = new URLSearchParams(window.location.search);
    const callArgs = callArgsHandle(urlParams.get('call_args')) || [9];

    function callArgsHandle(value) {
      if(!value) return null;

      return value.split("|").map(a => parseInt(a));
    }

    return (
      <ThemeProvider theme={lightTheme}>
        <Provider {...stores}>
          <FirebaseContext.Provider value={new Firebase()}>
            <Router>
              <div className="App">
                <Observer render={() => stores.lnfStore.fullscreen ? <Fragment /> : <Fragment>
                  <AxlHeader
                    darkTheme={false}
                    title={'DISPATCH'}
                    client={stores.userStore.user}
                    onClick={this.toogleMenuSlider}
                    logout={this.logout}
                    onHandleMainMenu={stores.lnfStore.toggleMainMenu} />
                  <MainMenu />
                </Fragment>
                } />
                <MainMenuWrapper stores={stores} />
                <Observer render={() => <div
                  onClick = {() => stores.lnfStore.toggleFullScreen() }
                  style={{ width: '32px', height: '32px', borderRadius: '16px', position: 'absolute', top: stores.lnfStore.fullscreen ? '2px' : '60px', right: '8px', opacity: stores.lnfStore.fullscreen ? 0.2 : 0.05, backgroundColor: 'white', zIndex: 1000, cursor: 'pointer' }}>
                  <i className={'fa fa-arrows'} style={{fontSize: '16px', padding: '8px'}} />
                </div> } />
                <div className="main-content">
                  <Switch>
                    <Route path="/linehauls" component={LinehaulDashboard} />
                    <Route path="/dashboard" component={DashboardScreen} />
                    <Route path='/driver-registration' component={DriverRegistrationScreen} />
                    <Route path='/drivers/:id' component={DriverDetailScreen} />
                    <Route path='/drivers' component={DriverListScreen} />
                    <Route path='/driver-crews' component={DriverCrewScreen} />
                    <Route path='/driver-pools' component={DriverPoolScreen} />
                    <Route path='/driver-announcements' component={DriverAnnouncementScreen} />
                    <Route path='/driver-probations' component={DriverSuspensionScreen} />
                    <Route path='/driver-renewal' component={DriverRenewalScreen} />
                    <Route path='/toast' component={ToastScreen} />
                    <Route path='/clients' component={ClientScreen} />
                    <RolesAuthRoute
                      path="/geocode-addresses"
                      roles={['super-admin']}
                    >
                      <GeocodeAddressScreen />
                    </RolesAuthRoute>
                    <Route path="/search" component={SearchScreen} />
                    <Route path="/schedule" component={ScheduleScreen} />
                    <Route path="/assignments/:assignmentId" component={AssignmentDetailScreen} />
                    <Route path="/assignments" component={DashboardScreen} />
                    <Route path="/routes/:day/:region/:client/:assignmentId" component={DispatchScreen} />
                    <Route path="/routes/:day/:region/:client" component={DispatchScreen} />
                    <Route path="/routes/:day/:region" component={DispatchScreen} />
                    <Route path="/routes/:day" component={DispatchScreen} />
                    <Route path="/routes" component={DispatchScreen} />
                    <Route path="/driver-pickup" component={DriverPickupScreen} />
                    <Route path="/messenger/:id" component={MessengerScreen} />
                    <Route path="/messenger" component={MessengerScreen} />
                    <Route path="/call-center/results" render={() => {
                      if([DEFINED.UNKNOWN_RECIPIENT, DEFINED.RECIPIENT].indexOf(callArgs[0]) !== -1) {
                        return <RedirectCallCenter />
                      } else {
                        return <CallCenterScreen />
                      }
                    }} />
                    <Route path="/ticket-booking" exact={true} component={TicketBookingScreen} />
                    <Route path="/ticket-booking/:id" component={TicketBookingSessionScreen} />
                    <Route path="/abandoned-calls" component={CallCenterAbandondedScreen} />
                    <Route path="/redelivery/multi/v2" component={AddRedeliveryV2} />
                    <Route path="/redelivery/multi" component={AddRedelivery} />
                    <Route path="/shipments/:id" component={ShipmentScreen} />
                    <Route path={["/frankenroute/:id", "/frankenroute"]} component={Frankenroute} />
                    <Route path="/driver-rating-config" component={DriverRatingConfig}/>
                    <Route path="/" component={DispatchScreen} />
                  </Switch>
                </div>
                <AxlLeftSideMenu isActive={isActive} onClose={this.closeMenuSlider}/>
              </div>
            </Router>
            <ToastContainer enableMultiContainer containerId="main"/>
            <RequestErrorHandlerManager />
          </FirebaseContext.Provider>
        </Provider>
      </ThemeProvider>
    );
  }
}

export default App;

class RedirectCallCenter extends React.PureComponent {
  render() {
    window.location.href = `${process.env.REACT_APP_SUPPORT_URL}/call-center/results${window.location.search}`;
    return <div>Redirecting...</div>;
  }
}
