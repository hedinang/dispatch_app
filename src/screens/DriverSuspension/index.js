import React, { Component } from 'react';
import {Route, Switch} from 'react-router-dom';

import DriverSuspensionList from "../../containers/DriverSuspension";

class DriverSuspensionScreen extends Component {
  render() {
    return <div>
      <Switch>
        <Route exact path='/driver-probations/new' component={DriverSuspensionList} />
        <Route exact path='/driver-probations/:suspensionId/edit' component={DriverSuspensionList} />
        <Route path='/driver-probations' component={DriverSuspensionList} />
      </Switch>
    </div>
  }
}

export default DriverSuspensionScreen
