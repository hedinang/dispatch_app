import React, { Fragment } from 'react';
import Rating from 'react-rating';
import _ from 'lodash';
import moment from 'moment-timezone';
import {
  AxlModal, AxlPanel
} from 'axl-reactjs-ui';
import {inject, observer} from "mobx-react";
import {ThemeProvider, Tooltip, Typography} from "@material-ui/core";

import styles, * as E from './styles';
import {lightTheme} from "../../themes";
import Tag from '../Driver/Tag';

@inject('driverStore')
export default class DriverProfileInformation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      driverInfo: null,
      unsubscribed: false,
    }
  }

  componentDidMount() {
    const {driver, driverStore} = this.props;

    driverStore.get(driver.id, (resp) => {
      this.setState({driverInfo: resp.data});
    });
    driverStore.checkUnsubscribed(driver.id, res => this.setState({unsubscribed: res.data.unsubscribed}));
  }

  render() {
    const driver = this.state.driverInfo;
    if (!driver) return <div>Loading...</div>;

    const pools = _.map(_.get(driver, 'pools', []), p => _.pick(p, ['pool_name', 'description']));

    return <ThemeProvider theme={lightTheme}>
      <E.Container>
        <AxlPanel>
          <AxlPanel.Row>
            <AxlPanel.Col flex={0}>
              <E.DriverInfoContainer>
                <E.DriverAvatar>
                  <E.Avatar src={driver.photo} />
                </E.DriverAvatar>
                <E.DriverSince>{`Driver since: ${driver.background_decision_ts ? moment(driver.background_decision_ts).format('MM/DD/YYYY') : ''}`}</E.DriverSince>
              </E.DriverInfoContainer>
            </AxlPanel.Col>
            <AxlPanel.Col>
              <AxlPanel.Row>
                <AxlPanel.Col>
                  <E.DriverNameContainer>
                    <E.DriverName>{`${_.get(driver, 'first_name', '')} ${_.get(driver, 'last_name', '')}`}</E.DriverName>
                    <E.DriverId>{`#${driver.id}`}</E.DriverId>
                    <Tag>{driver.tags}</Tag>
                    {/*<E.DriverRegion>{`SFO`}</E.DriverRegion>*/}
                  </E.DriverNameContainer>
                </AxlPanel.Col>
                <AxlPanel.Col flex={0}>
                  <E.LabelStatus>{`Status: `}<E.Status>{driver.status}</E.Status></E.LabelStatus>
                </AxlPanel.Col>
              </AxlPanel.Row>
              <E.RatingContainer>
                <Rating readonly={true} initialRating={Math.round(driver.driverScore)} emptySymbol={<img src="/assets/images/star-2.png" />} fullSymbol={<img src="/assets/images/star-3.png" />} />
              </E.RatingContainer>
              <AxlPanel.Row style={styles.driverRow}>
                <AxlPanel.Col>
                  <E.DriverLabel>{`Phone Number`}</E.DriverLabel>
                  <E.Text_1>{_.get(driver, 'phone_number', '-')}</E.Text_1>
                </AxlPanel.Col>
                <AxlPanel.Col>
                  <E.DriverLabel>{`E-mail`}</E.DriverLabel>
                  <E.Text_1>{_.get(driver, 'email', '-')}</E.Text_1>
                </AxlPanel.Col>
                <AxlPanel.Col>
                  <E.DriverLabel>{`Zipcode`}</E.DriverLabel>
                  <E.Text_1>{_.get(driver, 'home_address.zipcode', '-')}</E.Text_1>
                </AxlPanel.Col>
                <AxlPanel.Col>
                  <E.DriverLabel>{`POOL`}</E.DriverLabel>
                  <E.Text_1>
                    {pools.filter(p => p.pool_name).map((p, i) => <Tooltip key={i} title={_.get(p, 'description', '')}>
                      <E.PoolText>{(pools.length > 1 && i > 0) ? ', ' : ''}{_.get(p, 'pool_name')}</E.PoolText>
                    </Tooltip>)}
                    {(!pools || pools.length == 0) && <E.Text_1>-</E.Text_1>}
                  </E.Text_1>
                </AxlPanel.Col>
              </AxlPanel.Row>
              <AxlPanel.Row style={styles.driverRow}>
                <AxlPanel.Col>
                  <E.DriverLabel>{`Vehicle Info`}</E.DriverLabel>
                  <E.Text_1>{`${_.defaultTo(driver.vehicle_color, '')} ${_.defaultTo(driver.vehicle_make, '')} ${_.defaultTo(driver.vehicle_model, '')}`}</E.Text_1>
                </AxlPanel.Col>
                <AxlPanel.Col>
                  <E.DriverLabel>{`License Plate`}</E.DriverLabel>
                  <E.Text_1>{`${driver.vehicle_license_plate_state ? driver.vehicle_license_plate_state + ' - ' : ''}${driver.vehicle_license_plate ? driver.vehicle_license_plate : ''}`}</E.Text_1>
                </AxlPanel.Col>
                <AxlPanel.Col>
                  <E.DriverLabel>{`Drivers License`}</E.DriverLabel>
                  <E.Text_1>{_.get(driver, 'driver_license', '-')}</E.Text_1>
                </AxlPanel.Col>
                <AxlPanel.Col>
                  <E.DriverLabel>{`Regions`}</E.DriverLabel>
                  <E.Text_1>{driver.regions && driver.regions.join()}</E.Text_1>
                  {(!driver.regions || driver.regions.length == 0) && <E.Text_1>-</E.Text_1>}
                </AxlPanel.Col>
              </AxlPanel.Row>    
              <AxlPanel.Row style={styles.driverRow}>
                <AxlPanel.Col>
                  <E.DriverLabel>{`SMS Unsubscribed`}</E.DriverLabel>
                  <E.Text_1>{this.state.unsubscribed ? 'YES' : 'NO'}</E.Text_1>
                </AxlPanel.Col>
                <AxlPanel.Col>
                  <E.DriverLabel>{`Couriers/DSP`}</E.DriverLabel>
                  <E.Text_1>{driver.couriers && driver.couriers.map(c => c.company).join() || "-"}</E.Text_1>
                </AxlPanel.Col>
                <AxlPanel.Col style={{flex: 2}}>
                  <E.DriverLabel>DSP Converted</E.DriverLabel>
                  <E.Text_1>{driver && driver.convert_event && driver.convert_event.length > 0 ? (
                    <React.Fragment>
                      {driver.convert_event[0].fact.dsp_name && <Typography sx={{ fontWeight: 'medium', m: 1 }}>Converted from {driver.convert_event[0].fact.dsp_name} to AH drivers</Typography>}
                      <i>by <strong>{driver.convert_event[0].fact.reverted_username}</strong> {moment.tz(driver.convert_event[0].ts, moment.tz.guess()).format('M/D/YYYY, hh:mm z')}</i>
                    </React.Fragment>
                    ) : (
                    <React.Fragment>Not converted</React.Fragment>
                    )}
                  </E.Text_1>
                </AxlPanel.Col>
              </AxlPanel.Row>
            </AxlPanel.Col>
          </AxlPanel.Row>
          <E.RatingContainer>
          </E.RatingContainer>
        </AxlPanel>
      </E.Container>
    </ThemeProvider>
  }
}
