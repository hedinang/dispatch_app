import React from 'react';
import Rating from 'react-rating';
import {
  AxlModal, AxlPanel
} from 'axl-reactjs-ui';
import DriverProfileInformation from '../../components/DriverProfileInformation';
import DriverProfileRoutingTabs from '../../components/DriverProfileRoutingTabs';

import styles, * as E from './styles';

export default class DriverProfileScreen extends React.Component {
  render() {
    return <E.Container>
      <AxlModal style={styles.modalContainer} onClose={() => console.log('onClose')}>
        <DriverProfileInformation />
        <DriverProfileRoutingTabs />
      </AxlModal>
    </E.Container>
  }
}
