import React, { Component, } from 'react';
import styles from './styles';
import _ from 'lodash'
import moment from 'moment-timezone';
import HistoryItem from '../HistoryItem';

class AssignmentHistory extends Component {
    constructor(props) {
        super(props)
        this._renderStop = this._renderStop.bind(this)
    }

    _renderSucceddedDeliver(driver, stop) {
        const { label } = stop
        return <div key={stop.id} style={styles.event}>
            <HistoryItem event={stop} status='SUCCEEDED' dotLeft={-4}>
                { driver && <span>Driver <b>{ driver.first_name }</b></span>} successfully delivered shipment {label ? label.driver_label : stop.shipment_id}
                { stop.remark && <span> with remark: </span> }
                { stop.remark && <div style={styles.remark}>"{stop.remark}"</div> }
                <div style={styles.dateTime}>{moment.tz(stop.actual_departure_ts, moment.tz.guess()).format('hh:mm:ss a z')}</div>
            </HistoryItem>
        </div>
    }

    _renderFailedDeliver(driver, stop) {
        const { label } = stop
        return <div key={stop.id} style={styles.event}>
            <HistoryItem event={stop} status='FAILED' dotLeft={-4}>
                { driver && <span>Driver <b>{ driver.first_name }</b></span>} was unsuccessfully delivering shipment {label ? label.driver_label : stop.shipment_id}
                { stop.remark && <span> with remark: </span> }
                { stop.remark && <div style={styles.remark}>"{stop.remark}"</div> }
                <div style={styles.dateTime}>{moment.tz(stop.actual_departure_ts, moment.tz.guess()).format('hh:mm:ss a z')}</div>
            </HistoryItem>
        </div>
    }

    _renderStop(driver, stop) {
        return stop.status === 'SUCCEEDED' ? this._renderSucceddedDeliver(driver, stop) : this._renderFailedDeliver(driver, stop)
    }

    render() {
        const { assignment } = this.props
        let driver = assignment ? assignment.driver : null
        const stops = !assignment ? [] : assignment.stops.filter(s => s.type === 'DROP_OFF')
            .filter(s => s.actual_departure_ts)
        const sortedStops = _.reverse(_.sortBy(stops, (s) => s.actual_departure_ts))
        return <div style={styles.container}>
            { assignment && assignment.assignment && assignment.assignment.id && <div style={styles.title}>{`Assignment ${assignment.assignment.label} - History`}</div> }
            <div style={styles.list}>
                { sortedStops.map((s) => this._renderStop(driver, s))}
            </div>
        </div>
    }
}

export default AssignmentHistory
