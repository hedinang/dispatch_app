import React, { Component } from 'react';
import moment from 'moment-timezone';
import _ from 'lodash';
// Styles
import styles, { Container, Inner, List, Item, Circle, Date, Text } from './styles';

const getMessage = (options, msg, isRemark) => `<div>Driver <b>${options['DRIVER_NAME']}</b> ${msg} 
  to ${options['CUSTOMER_NAME']} (${options['DRIVER_LABEL']})</div>
  ${isRemark ? `<div>with remark: <i><small>${isRemark ? options['REMARK'] : ''}</small></i></div>` : ""}`
export default class DriverHistoryList extends Component {
  getHistoryStatus(status, type, options) {
    let result = '';
    if(type === 'pickupShipment') {
      if(status === 'FAILED') {
        result = getMessage(options, 'unsuccessfully pickup shipment', !_.isEmpty(options['REMARK']));
      }
      else if(status === 'SUCCEEDED') {
        result = getMessage(options, 'successfully pickup shipment', !_.isEmpty(options['REMARK']));
      }
      else if(status === 'EN_ROUTE' || status === 'READY') {
        result = getMessage(options, 'is picking up shipment', false);
      }
    } else if(type === 'deliverShipment') {
      if(status === 'SUCCEEDED') {
        result = getMessage(options, 'successfully delivered shipment', !_.isEmpty(options['REMARK']));
      } else if(status === 'FAILED') {
        result = getMessage(options, 'was unsuccessful deliver shipment', !_.isEmpty(options['REMARK']));
      } else if(status === 'EN_ROUTE' || status === 'READY') {
        result = getMessage(options, 'is delivering shipment', false);
      }
    } else {
      result = 'Invalid';
    }

    return result;
  }

  render() {
    const { status } = styles;
    let events = this.props.history || [];

    return <Container>
      <Inner>
        <List>
          { events.map((h,i) => {
            const options = {
              'REMARK': h.remark,
              'DRIVER_NAME': h.driver_name || 'unknow',
              'DRIVER_LABEL': h.driver_label || 'unknow',
              'CUSTOMER_NAME': h.customer_name || 'unknow'
            };

            return <Item key={i}>
              <Circle  style={{backgroundColor: status[h.status]}}/>
              <Text dangerouslySetInnerHTML={{__html: this.getHistoryStatus(h.status, h.type, options)}} />
              <Date>{_.has(h, 'actual_departure_ts') ? moment.tz(h.actual_departure_ts, moment.tz.guess()).format('dddd M/D/YYYY - HH:mm:ss a z') : '-'}</Date>
            </Item>
          })}
        </List>
      </Inner>
    </Container>
  }
}
