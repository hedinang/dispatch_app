import React, { Component } from 'react';
import {Route, Switch} from 'react-router-dom';

import ClientList from "../../containers/Client";


class ClientScreen extends Component {
  render() {
    return <div>
      <Switch>
        <Route exact path='/clients/:id/settings' component={ClientList} />
        <Route path='/clients' component={ClientList} />
      </Switch>
    </div>
  }
}

export default ClientScreen
