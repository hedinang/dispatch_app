import React, { Component } from 'react';
import {Route, Switch} from 'react-router-dom';

import DriverPoolList from '../../containers/DriverPoolList/index';
import DriverPoolForm from '../../containers/DriverPoolList/form';
import DriverPoolDetail from '../../containers/DriverPoolList/detail';

class DriverPoolScreen extends Component {
  render() {
    return <div>
      <Switch>
        <Route exact path='/driver-pools/new' component={DriverPoolList} />
        <Route exact path='/driver-pools/:poolId/edit' component={DriverPoolList} />
        <Route path='/driver-pools/:poolId' component={DriverPoolDetail} />
        <Route path='/driver-pools' component={DriverPoolList} />
      </Switch>
    </div>
  }
}

export default DriverPoolScreen
