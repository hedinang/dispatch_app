import React, { Component } from 'react';
import styles from './styles';
import Moment from 'react-moment';
import { DialogActions, DialogTitle, Divider, Grid, TextField } from "@material-ui/core";
import {texts} from '../../styled-components';
import ThumbUp from '@material-ui/icons/ThumbUp';
import ThumbDown from '@material-ui/icons/ThumbDown';

import { AxlButton, AxlPanel } from 'axl-reactjs-ui';

class CustomerProfileInfo extends Component {
    render() {
        const { profile } = this.props
        const { corrected_address, id, address, instructions, total_customer_negative_feedbacks, total_customer_positive_feedbacks } = profile || {}
        if (!profile) return <div></div>
        return <div style={texts.body}>
            <div style={{display: 'flex'}}>
                <div style={{...texts.label2, ...{flex: 1}}}>Customer feedbacks</div>
                <div style={{flex: 1}}> 
                    <span style={{ display:'inline-flex', alignItems: 'center', color: '#4abc4e' }} className="legend-label">
                        <ThumbUp />

                        <span style={{ margin: 5, color: 'blue', fontSize: '1.2em'}}>{total_customer_positive_feedbacks}</span>
                    </span>

                    <span style={{ display:'inline-flex', alignItems: 'center', color: '#d0021b', marginLeft: 30 }} className="legend-label">
                        <ThumbDown />

                        <span style={{ margin: 5, color: '#d0021b', fontSize: '1.2em'}}>{total_customer_negative_feedbacks}</span>
                    </span>
                </div>
            </div>
            <Divider style={{marginTop: 10, marginBottom: 8}} />
            <div style={{position: 'relative'}}>
                <div style={texts.label2}>Special Instructions</div>
                { instructions && <div>{instructions}</div> }
            </div>
        </div>
    }
}

export default CustomerProfileInfo;