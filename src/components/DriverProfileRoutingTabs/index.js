import React from 'react';
import { AxlButton, AxlPanel, AxlLoading } from 'axl-reactjs-ui';
import PropTypes from 'prop-types';
import DriverProfileDashbroad from '../DriverProfileDashbroad';
import DriverProfileRoutingTab from '../DriverProfileRoutingTab';

import styles, * as E from './styles';
import DriverProfileAppeal from "../DriverProfileRoutingTab/DriverProfileAppeal";
import DriverProfilePerformance from "../DriverProfileRoutingTab/DriverProfilePerformance";
import DriverProfileProbation from "../DriverProfileRoutingTab/DriverProfileProbation";

export default class DriverProfileRoutingTabs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: props.activeTab,
      suspensionsStatus: false
    }
    this.toggleTab = this.toggleTab.bind(this);
  }

  toggleTab = (id) => () => {
    this.setState({activeTab: id})
  }

  suspensionsUpdate = (value) => {
    this.setState({suspensionsStatus: value})
  }

  render() {
    const { activeTab, suspensionsStatus } = this.state;
    const {driver} = this.props;

    return <E.Container>
      <E.Inner>
        <E.TabHeader>
          <E.TabGroupItem>
            <E.TabIcon className={activeTab === 0 ? 'active' : ''} onClick={this.toggleTab(0)}><i className="fa fa-bar-chart" /></E.TabIcon>
            <E.TabIcon className={activeTab === 1 ? 'active' : ''} onClick={this.toggleTab(1)}><i className="fa fa-exclamation-triangle" style={{color: suspensionsStatus ? '#d63031': '#000'}}/></E.TabIcon>
          </E.TabGroupItem>
          {/*<E.TabItem className={activeTab === 9 ? 'active' : ''} onClick={this.toggleTab(9)}>{`Performance`}</E.TabItem>*/}
          <E.TabItem className={activeTab === 2 ? 'active' : ''} onClick={this.toggleTab(2)}>{`Active Route`}</E.TabItem>
          <E.TabItem className={activeTab === 3 ? 'active' : ''} onClick={this.toggleTab(3)}>{`Pending Routes`}</E.TabItem>
          <E.TabItem className={activeTab === 4 ? 'active' : ''} onClick={this.toggleTab(4)}>{`Past Routes`}</E.TabItem>
          <E.TabItem className={activeTab === 5 ? 'active' : ''} onClick={this.toggleTab(5)}>{`Driver Activity`}</E.TabItem>
          <E.TabItem className={activeTab === 6 ? 'active' : ''} onClick={this.toggleTab(6)}>{`Payment`}</E.TabItem>
          <E.TabItem className={activeTab === 8 ? 'active' : ''} onClick={this.toggleTab(8)}>{`Appeal`}</E.TabItem>
        </E.TabHeader>
        <E.TabContent>
          {/*{activeTab === 0 && <DriverProfileDashbroad driver={driver} />}*/}
          {activeTab === 0 && <DriverProfilePerformance driver={driver} />}
          {activeTab === 1 && <DriverProfileProbation driver={driver} update={this.suspensionsUpdate}/>}
          {activeTab === 2 && <DriverProfileRoutingTab.Active driver={driver} history={this.props.history} />}
          {activeTab === 3 && <DriverProfileRoutingTab.Pending driver={driver} />}
          {activeTab === 4 && <DriverProfileRoutingTab.Past driver={driver} />}
          {activeTab === 5 && <DriverProfileRoutingTab.Activity driver={driver} />}
          {activeTab === 6 && <DriverProfileRoutingTab.Payment driver={driver} />}
          {activeTab === 8 && <DriverProfileAppeal driver={driver} />}
        </E.TabContent>
      </E.Inner>
      {this.props.isShowAction && <E.Control>
        <AxlButton compact bg={`pink`} style={styles.controlButton} onClick={this.props.onSave}>{`Done`}</AxlButton>
      </E.Control>}
    </E.Container>
  }
}

DriverProfileRoutingTabs.propTypes = {
  isShowAction: PropTypes.bool,
  activeTab: PropTypes.number
}

DriverProfileRoutingTabs.defaultProps = {
  isShowAction: true,
  activeTab: 1
}