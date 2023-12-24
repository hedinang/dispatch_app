import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import styles from './styles';
import HistoryEvent from '../../components/HistoryEvent'
import HistoricalDelivery from '../../components/HistoricalDelivery';
import { Divider } from '@material-ui/core';
import { AxlLoading } from 'axl-reactjs-ui';

@inject('profileStore')
@observer
class DeliveryHistory extends Component {
    constructor(props) {
        super(props)
        this.state = {
        };
        const { profileStore, id } = this.props
        profileStore.loadHistory(id)
    }

    componentWillReceiveProps(props) {
        const { profileStore, id } = this.props
        if (props.id === id) return
        profileStore.loadHistory(props.id)
    }

    render() {
        const { profileStore } = this.props
        const { profileHistory, loadingHistory } = profileStore
        if (loadingHistory) {
            return <AxlLoading />
        }
        if (!profileHistory) return <div>No delivery history found!</div>
        return <div>
            {profileHistory.items.map((e) => <div key={e.shipment.id}><Divider style={{marginTop: 10, marginBottom: 10}} /><HistoricalDelivery shipmentInfo={e} /></div>)}
        </div>
    }
}

export default DeliveryHistory;