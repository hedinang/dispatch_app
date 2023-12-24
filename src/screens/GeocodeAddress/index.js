import React, { Component } from 'react';
import {Route, Switch} from 'react-router-dom';

import GeocodeAddressList from '../../containers/GeocodeAddress/list';

class GeocodeAddressScreen extends Component {
  render() {
    return <div>
      <Switch>
        <Route exact path='/re-geocode' component={GeocodeAddressList} />
        <Route exact path='/geocode-addresses/new' component={GeocodeAddressList} />
        <Route exact path='/geocode-addresses/:addressId/edit' component={GeocodeAddressList} />
        <Route path='/geocode-addresses/:addressId' component={GeocodeAddressList} />
        <Route exact path='/geocode-addresses' component={GeocodeAddressList} />
      </Switch>
    </div>
  }
}

export default GeocodeAddressScreen
