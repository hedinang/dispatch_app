import React, { Component } from 'react';
import { Styles } from 'axl-reactjs-ui';
import styles from './styles';
import { inject, observer, Observer } from 'mobx-react';
import DriverPickupTimeContainer from '../../containers/DriverPickupTime/index';

import {
  withRouter,
  Route,
  Switch
} from 'react-router-dom'

@inject('driverPickupStore')
class DriverPickupScreen extends Component {
  constructor(props) {
    super(props)
    this.gotoRegion = this.gotoRegion.bind(this)
  }

  gotoRegion(r) {
    const { history, match } = this.props
    history.push(`${match.url}/${r}`)
  }

  render() {
    const { match } = this.props
    const regions = [ 'SFO', 'LAX', 'JFK', 'SEA', 'PHX', 'PDX', 'DFW', 'CHI' ]
    return <div>
      <Observer render={() =>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        { regions.map(region => <div key={region} style={{...styles.regionName,...{backgroundColor: this.props.driverPickupStore.region === region ? '#afc' : '#efefef'}}} onClick={() => this.gotoRegion(region)}>{region}</div>)}
      </div>} />
      <Switch>
        <Route
          path={`${match.path}/:region`}
          render={props => <DriverPickupTimeContainer {...props} /> }
        />
        <Route exact
          render={() => <div>Select a region to view</div> }
        />
      </Switch>
    </div>
  }
}

export default DriverPickupScreen
