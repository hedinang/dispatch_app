import React, { Component } from 'react';

import styles from './styles'

export default class AssignmentHistoryDetail extends Component {
  render() {
    return <div style={styles.container}>
      <div style={styles.title}>{`History Detail`}</div>
      <div style={styles.items}>
        <div style={styles.line}></div>
        {[0, 1, 2, 3, 4].map((index) => <div style={styles.item} key={index}>
          <span style={styles.car}>
            <span style={styles.innerCar}><i className='fa fa-car' /></span>
          </span>
          <div style={styles.inner}>
            <div style={styles.info}>
              <div style={styles.text}>{`1/4/2019 5:52 AM`}</div>
              <div style={styles.text}>{`Drop Off Succeeded`}</div>
            </div>
            <div style={styles.notes}>{`Driver Odin Asgard successfully delivered shipment AA-2 with remark: "Left with/at Mailbox/Mailroom"`}</div>
          </div>
          <div style={styles.clear}></div>
        </div>)}
      </div>
    </div>
  }
}
