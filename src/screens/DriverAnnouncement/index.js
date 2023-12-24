import React, { Component } from 'react';
import {Route, Switch} from 'react-router-dom';

import DriverAnnouncementList from "../../containers/DriverAnnouncement";
import DriverAnnouncementDetail from "../../containers/DriverAnnouncement/detail";

class DriverAnnouncementScreen extends Component {
  render() {
    return <div>
      <Switch>
        <Route exact path='/driver-announcements/new' component={DriverAnnouncementList} />
        <Route exact path='/driver-announcements/:announcementId/edit' component={DriverAnnouncementList} />
        <Route path='/driver-announcements/:announcementId' component={DriverAnnouncementDetail} />
        <Route path='/driver-announcements' component={DriverAnnouncementList} />
      </Switch>
    </div>
  }
}

export default DriverAnnouncementScreen
