import React, { Component } from 'react';
import {inject, observer, Observer} from "mobx-react";
import {Route, Switch, Link} from 'react-router-dom';


import {AxlButton, AxlModal, AxlSearchBox} from "axl-reactjs-ui";
import styles from "./styles";

@inject('geocodeAddressListStore')
@observer
class GeocodeAddressDetail extends Component {
  componentDidMount() {
    const {geocodeAddressListStore, match} = this.props;
    geocodeAddressListStore.get(match.params.addressId);
  }

  componentDidUpdate(prevProps) {
    const {geocodeAddressListStore} = this.props;
    const {address} = geocodeAddressListStore;

    if (this.props.match.params.addressId != prevProps.match.params.addressId) {
      geocodeAddressListStore.get(this.props.match.params.addressId);
    }
  }

  render() {
    const {geocodeAddressListStore} = this.props;
    const {address} = geocodeAddressListStore;
    // need to display loading
    console.log('address is: ', address);
    if (!address) return null;

    return <div style={styles.container}>
        <div style={styles.itemWrapper}>
          <div style={styles.label}>Street</div>
          <div style={styles.content}>{address.street}</div>
        </div>
        <div style={styles.itemWrapper}>
          <div style={styles.label}>City</div>
          <div style={styles.content}>{address.city}</div>
        </div>
        <div style={styles.itemWrapper}>
          <div style={styles.label}>State</div>
          <div style={styles.content}>{address.state}</div>
        </div>
        <div style={styles.itemWrapper}>
          <div style={styles.label}>Zipcode</div>
          <div style={styles.content}>{address.zipcode}</div>
        </div>
        <div style={styles.itemWrapper}>
          <div style={styles.label}>Lat/Lng</div>
          <div style={styles.content}>
            <a target="_blank" href={`https://www.google.com/maps?q=${address.latitude},${address.longitude}`}>{address.latitude}, {address.longitude}</a>
          </div>
        </div>
        <div>
          <AxlButton onClick={() => this.props.history.goBack()} compact={true}>BACK</AxlButton>
        </div>
    </div>
  }
}

export default GeocodeAddressDetail;