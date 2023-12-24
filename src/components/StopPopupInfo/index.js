import React, { Component } from 'react';
import styles from './styles';

class StopPopupInfo extends Component {
    render() {
        const {stop} = this.props
        const {shipment, label} = stop
        return <div style={styles.container}>
            <div style={{textAlign: 'center'}}>
                <code>{shipment.id}</code> <b>{label.driver_label}</b>
            </div>
            <div>
                <b>{shipment.customer.name}</b>
            </div>
            <div>
                {shipment.dropoff_address.street} {shipment.dropoff_address.street2}
            </div>
            <div>
                {shipment.dropoff_address.city}, {shipment.dropoff_address.state} {shipment.dropoff_address.zipcode}
            </div>
        </div>
    }
}

export default StopPopupInfo