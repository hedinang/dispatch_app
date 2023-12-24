import React, { Component } from 'react';
import { AxlMultiSelect } from 'axl-reactjs-ui';
import { inject, observer } from 'mobx-react';
import {
    BrowserRouter as Router,
    withRouter,
  } from 'react-router-dom';

// Styles
import { Container, GroupField, Label } from './styles';

@inject( 'shipmentStore', 'clientStore', 'regionStore')
@observer
class OverallSearchFilter extends Component {
  constructor(props) {
      super(props)
      const { day, region, client, assignmentId } = this.props.match.params
      this.prioritized = [49, 105, 67, 78, 68, 44, 94, 84, 64, 76, 66, 30, 88, 99, 93, 72]
  }

  componentDidMount() {
      const { clientStore, regionStore } = this.props
      clientStore.init();
      regionStore.init();
  }

  setRegions(regions) {
      const { shipmentStore, history } = this.props
      shipmentStore.setRegions(regions.map(r => r.value))
  }

  setClients(clients) {
      const { shipmentStore, history } = this.props
      shipmentStore.setClients(clients.map(r => r.value))
  }

  setStatus(statuses) {
    const { shipmentStore, history } = this.props
    shipmentStore.setStatuses(statuses.map(r => r.value))
  }

  render() {
    const statusOptions = [
      { label: 'SUCCEEDED', value: 'DROPOFF_SUCCEEDED'},
      { label: 'FAILED', value: 'PICKUP_FAILED,DROPOFF_FAILED'},
      { label: 'ERRORED', value: 'GEOCODE_FAILED'},
      { label: 'IN PROGRESS', value: 'PICKUP_SUCCEEDED,PICKUP_EN_ROUTE,DROPOFF_EN_ROUTE,PICKUP_READY,DROPOFF_READY'},
      { label: 'PROCESSING', value: 'GEOCODED,CREATED,PENDING'},
    ]

    const { shipmentStore, clientStore, regionStore } = this.props
    const { regions, clients } = shipmentStore;
    let clientMap = {}
    clientStore.clients.forEach(c => {
      clientMap[c.client_id] = { label: c.name, value: c.client_id }
    })
    const REGIONS = regionStore.regions;

    const prioritized = this.prioritized.map(p => clientMap[p]).filter(Boolean)
    const normal = clientStore.clients.filter(c => this.prioritized.indexOf(c.client_id) < 0).filter(c => c.client_id > 7).map(c => Object.assign({}, { label: c.name, value: c.client_id }))
    const clientOptions = [{value: 0, label: 'COMMINGLE'},{value: 1, label: 'ON-DEMAND'}].concat(prioritized).concat(normal)

    return <Container>
      <GroupField>
        <Label>{`Search at`}</Label>
        <AxlMultiSelect
          defaulValue={REGIONS.filter(option => regions.indexOf(option.value) >= 0)}
          placeholderButtonLabel="all regions"
          showValues={false}
          allowAll={true}
          onChange={(v) => this.setRegions(v)}
          placeholder="Search Regions…"
          options={REGIONS}
          style={{minWidth: '205px'}}
        />
      </GroupField>
      <GroupField>
        <Label>{`for`}</Label>
        <AxlMultiSelect
          defaulValue={clientOptions.filter(option => clients.indexOf(option.value) >= 0)}
          placeholderButtonLabel="all clients"
          placeholder="Search Clients..."
          singular={true}
          allowAll={true}
          options={clientOptions}
          onChange={(v) => this.setClients(v)}
          multiple
        />
      </GroupField>
      <GroupField>
        <Label>{`with status`}</Label>
        <AxlMultiSelect
          placeholderButtonLabel="all statuses"
          placeholder="Search status"
          singular={true}
          allowAll={true}
          options={statusOptions}
          onChange={(v) => this.setStatus(v)}
          multiple
        />
      </GroupField>
    </Container>
  }
}

export default withRouter(OverallSearchFilter)
