import React, { Component } from 'react';
import {Route, Switch} from 'react-router-dom';

import DriverCrewList from '../../containers/DriverCrewList/index';
import DriverCrewDetail from '../../containers/DriverCrewList/detail';

class DriverCrewScreen extends Component {
  render() {
    return <div>
      <Switch>
        <Route exact path='/driver-crews/new' component={DriverCrewList} />
        <Route exact path='/driver-crews/:crewId/edit' component={DriverCrewList} />
        <Route path='/driver-crews/:crewId' component={DriverCrewDetail} />
        <Route path='/driver-crews' component={DriverCrewList} />
      </Switch>
    </div>
  }
}

export default DriverCrewScreen
