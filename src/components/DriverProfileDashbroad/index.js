import React from 'react';
import { inject, observer, Observer } from 'mobx-react';

import { AxlPanel } from 'axl-reactjs-ui';

import DriverProfilePieChart from '../DriverProfilePieChart';

import styles, * as E from './styles';

@inject('driverStore')
export default class DriverProfileDashbroad extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'ALL_TIME',
      statistics: [],
    };

    this.toggleTab = this.toggleTab.bind(this);
  }

  componentDidMount() {
    const {driverStore, driver} = this.props;
    driverStore.getStatistics(driver.id).then(response => {
      this.setState({statistics: response.data});
    });
  }

  toggleTab = (id) => () => {
    this.setState({activeTab: id})
  }

  render() {
    const { activeTab, statistics } = this.state;
    const statistic = statistics.length > 0 ? statistics.filter(s => s.type === activeTab) : (['ALL_TIME', 'past7', 'past30'].map(type => {
      return {
        clientLogos: [],
        clients: [],
        driver_pool: [],
        id: null,
        shipment_early_count: 0,
        shipment_failed_count: 0,
        shipment_late_count: 0,
        shipment_successful_count: 0,
        total_assignments: 0,
        total_shipments: 0,
        type: type,
        verify: false
      }}));

    return <E.Container>
      <E.Tabs>
        <E.Tab className={activeTab === 'ALL_TIME' ? 'active' : ''} onClick={this.toggleTab('ALL_TIME')}>{`All-Time`}</E.Tab>
        <E.Tab className={activeTab === 'past7' ? 'active' : ''} onClick={this.toggleTab('past7')}>{`Past Week`}</E.Tab>
        <E.Tab className={activeTab === 'past30' ? 'active' : ''} onClick={this.toggleTab('past30')}>{`Past Month`}</E.Tab>
      </E.Tabs>
      {statistic.length > 0 && <E.Content>
        <AxlPanel>
          <AxlPanel.Row>
            <AxlPanel.Col>
              <E.Box>
                <E.Text_1>{`Average Performance`}</E.Text_1>
                <DriverProfilePieChart statistic={statistic[0]} />
              </E.Box>
            </AxlPanel.Col>
            <AxlPanel.Col style={styles.colShipmentInfo}>
              <AxlPanel.Row style={styles.row}>
                <AxlPanel.Col style={styles.col}>
                  <E.Box>
                    <E.Label>{`Total Assignments`}</E.Label>
                    <E.Text_2>{statistic[0].total_assignments}</E.Text_2>
                  </E.Box>
                </AxlPanel.Col>
                <AxlPanel.Col style={styles.col}>
                  <E.Box>
                    <E.Label>{`Total Shipments`}</E.Label>
                    <E.Text_2>{statistic[0].total_shipments}</E.Text_2>
                  </E.Box>
                </AxlPanel.Col>
              </AxlPanel.Row>
              <AxlPanel.Row style={styles.row}>
                <AxlPanel.Col>
                  <E.Box>
                    <E.Label>{`Driver Pools`}</E.Label>
                    <E.Text_3>{statistic[0].driver_pool.join(', ')}</E.Text_3>
                  </E.Box>
                </AxlPanel.Col>
              </AxlPanel.Row>
            </AxlPanel.Col>
          </AxlPanel.Row>
          <AxlPanel.Row>
            <AxlPanel.Col>
              <E.BoxClient>
                <E.LabelClient>{`Clients`}</E.LabelClient>
                <E.ClientList>
                  {(statistic[0].clientLogos && Object.values(statistic[0].clientLogos).length > 0) && Object.values(statistic[0].clientLogos).filter(l => l).map((l, i) => <E.ClientLogo key={i} src={l} width={39} height={39} />)}
                </E.ClientList>
              </E.BoxClient>
            </AxlPanel.Col>
          </AxlPanel.Row>
        </AxlPanel>
      </E.Content>}
    </E.Container>
  }
}
