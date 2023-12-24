import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import LiveDeliveryStats from '../../containers/LiveDeliveryStats';
import { ACTIONS } from '../../constants/ActionPattern';

@inject('regionStore', 'clientStore', 'permissionStore')
@observer
class DashboardScreen extends Component {
  constructor(props) {
    super(props)
    this.gotoRegion = this.gotoRegion.bind(this)
  }
  gotoRegion(region, client) {
    const { history } = this.props
    history.push(`/routes/today/${region}/${client}`)
  }

  componentDidMount() {
    const { regionStore, clientStore } = this.props;
    regionStore.init();
    clientStore.getActiveClients();
  }

  render() {
    const { regionStore, clientStore, permissionStore } = this.props;
    const { regions } = regionStore;
    const { activeClients } = clientStore;
    const clientIds = activeClients.commingle;

    const isDenied = permissionStore.isDenied(ACTIONS.VIEW_DASHBOARD);

    if (isDenied) return null;

    return <div>
      <div style={{fontSize: '30px', padding: '10px', color: '#239'}}>Commingle</div>
      <div style={{display: 'flex', justifyContent: 'center', flexWrap: 'wrap'}}>
        {clientIds.length > 0 && regions.length > 0 && regions.map(region => (
          <LiveDeliveryStats
            key={region.value}
            history={this.props.history}
            onClick={() => this.gotoRegion(region.value, 0)}
            region={region.value}
            client={0}
            clientIds={clientIds}
          />
        ))}
      </div>
    </div>
  }
}

export default DashboardScreen
