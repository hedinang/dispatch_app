import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';
import Moment from "react-moment";
import Rating from 'react-rating';
import { AxlButton, AxlPanel, AxlModal } from 'axl-reactjs-ui';

import LyftInfo from './lyft';
import Tag from '../Driver/Tag';
import AssignmentAssign from '../AssignmentAssign';
import TooltipContainer from '../TooltipContainer';
import DriverDetailContainer from '../../containers/DriverDetail';

import styles from './styles';
import { ACTIONS } from '../../constants/ActionPattern';
import { PERMISSION_DENIED_TEXT } from '../../constants/common';

class DriverInfoCard extends Component {
    constructor (props) {
        super(props)
        this.state = {
            reason: '',
            showInfo: false,
            showDriverInfo: false,
            showDriverPicture: false,
            showUnassignDriver: false,
            showDriverProfile: false,
            warehouseInfo: null,
            disableUnassignDsp: false
        }
        this.onSaveRoutingTabs = this.onSaveRoutingTabs.bind(this);
        this.onShowDriverProfile = this.onShowDriverProfile.bind(this);
        this.onHideDriverProfile = this.onHideDriverProfile.bind(this);
    }

    componentDidMount() {
        this._getWarehouseInfo();
    }

    componentDidUpdate() {
        const { assignmentStore, assignment } = this.props;
        if(assignmentStore.warehouses && assignmentStore.warehouses.length === 0) {
            assignmentStore.getWarehouses(assignment.id).then(resp => {
                if (resp.ok) {
                    assignmentStore.pickupWarehouses = assignmentStore.warehouseIds && assignmentStore.warehouseIds.length > 0 && resp.data ? resp.data.filter(d => assignmentStore.warehouseIds.includes(d.id)) : resp.data;
                }
            });
        }
    }

    showUnassignDriver = () => {
        this.setState({showUnassignDriver: true});
    }

    hideUnassignDriver = () => {
        this.setState({showUnassignDriver: false});
    }

    updateReason = () => (e) => {
        this.setState({reason: e});
    }

    onShowDriverProfile = () => {
        if (this.props.driver) {
            this.setState({showDriverProfile: true})
        }
    }

    setDisableUnassignDsp = (disableUnassignDsp) =>{
        this.setState({disableUnassignDsp: disableUnassignDsp})
    }

    getCanDisableDsp = (courier,isActivated,isCompleted) => {
        const {disableUnassignDsp} = this.state;

        //if dsp is outsourced (Lyft, Workwhile,Frayt)
        if(courier && courier.settings && courier.settings.outsource){
            return !disableUnassignDsp && !isActivated && !isCompleted;
        }
        //else determine by courier that isn't outsourced
        return courier && !isActivated && !isCompleted;
    }

    onHideDriverProfile = () => {this.setState({showDriverProfile: false})}

    onSaveRoutingTabs() {}

    handleShowWarehouseInfo = () => {
        this._getWarehouseInfo();
        const { assignmentStore } = this.props;
        assignmentStore.isShowWarehouseInfo = !assignmentStore.isShowWarehouseInfo
    }

    _getWarehouseInfo() {
        const { assignment, assignmentStore } = this.props;
        if(assignment && assignment.warehouse_id && assignmentStore.warehouses) {
            const findWarehouse = assignmentStore.warehouses.find(f => f.id == assignment.warehouse_id);
            this.setState({warehouseInfo: findWarehouse})
        }
    }

    render() {
        const { driver, courier, isActivated, isCompleted, onUnAssignDriver, onUnAssignDsp, showDriverSearch, isReserved, assignmentId, assignment, labels, assignmentStore, permissionStore } = this.props;
        const { showDriverProfile, showDriverInfo, showInfo, warehouseInfo } = this.state;
        const canUnassign = driver && !isActivated && !isCompleted;
        const canUnassignDsp = this.getCanDisableDsp(courier,isActivated,isCompleted);
        const driverData = driver ? {
            ...driver,
            driverScore: this.props.driverScore ? this.props.driverScore : 0
        } : {
            fake: true,
            first_name: '',
            last_name: '',
            driverScore: 0,
            phone_number: '-',
            driver_license: '-',
            ssn_verified_by: '-',
            vehicle_make: '-',
            vehicle_model: '-',
            vehicle_color: '-',
            vehicle_license_plate: '-',
            vehicle_license_plate_state: '-'
        }
        let driverOptions = {
            props: {
                style: { width: '80px' },
                bg: 'periwinkle',
                tiny: true
            },
            onClick: () => this.hideUnassignDriver(),
            text: '',
            title: ''
        };

        if (!driver) {
            driverOptions = {
                props: {
                    style: { width: '80px' },
                    bg: 'periwinkle',
                    tiny: true,
                    disabled: isReserved
                },
                onClick: () => {
                    this.hideUnassignDriver();
                    showDriverSearch();
                },
                text: 'Assign',
                title: 'Assign'
            };
        }
        if (canUnassign) {
            driverOptions = {
                props: {
                    bg: 'none',
                    tiny: true
                },
                onClick: () => {
                    this.hideUnassignDriver();
                    onUnAssignDriver(this.state.reason);
                },
                text: `Unassign Driver - ${driver.first_name} [${driver.id}]`,
                title: 'Unassign Driver'
            };
        }
        if (driver && (isActivated || isCompleted)) {
            driverOptions = {
                props: {
                    tiny: true,
                    disabled: true,
                    style: {opacity: 0.5}
                },
                onClick: () => this.hideUnassignDriver(),
                text: `Unassign Driver - ${driver.first_name} [${driver.id}]`,
                title: 'Unassign Driver'
            };
        }

        const reAssignOptions = {
            props: {
                style: { width: '80px', margin: '0 3px' },
                bg: 'none',
                tiny: true
            },
            onClick: () => {
                this.hideUnassignDriver();
                showDriverSearch();
            },
            title: 'Reassign'
        };

        const unAssignDspOptions = {
            props: {
                bg: 'none',
                tiny: true
            },
            onClick: () => {
                this.hideUnassignDriver();
                onUnAssignDsp(this.state.reason);
            },
            text: `Unassign DSP - [${courier && courier.id}] ${courier && courier.code || ''} - ${courier && courier.company}`,
            title: 'Unassign DSP'
        };

        const isDenied = permissionStore.isDenied(ACTIONS.ASSIGNMENTS.ASSIGN);
        if (isDenied) _.set(driverOptions, 'props.disabled', true);

        return <div style={styles.container}>
            <AxlPanel.Row align={`center`}>
                <AxlPanel.Col>
                    <span style={styles.label2}>{courier ? 'DSP Info' : `Driver Info:`}</span>
                </AxlPanel.Col>
                {!courier && (
                  <Fragment>
                      {canUnassign && (
                        <div>
                          <TooltipContainer title={isDenied ? PERMISSION_DENIED_TEXT : ''}>
                            <AxlButton disabled={isDenied} onClick={this.showUnassignDriver} {...driverOptions.props}>{driverOptions.title}</AxlButton>
                          </TooltipContainer>
                          {this.state.showUnassignDriver && (
                            <AxlModal onClose={this.hideUnassignDriver} style={styles.modalStyle} containerStyle={styles.modalContainer}>
                                <AssignmentAssign {...driverOptions} updateReason={this.updateReason()} onClose={this.hideUnassignDriver} />
                            </AxlModal>
                          )}
                        </div>
                      )}
                      {canUnassign && (
                        <TooltipContainer title={isDenied ? PERMISSION_DENIED_TEXT : ''}>
                          <AxlButton disabled={isDenied} onClick={reAssignOptions.onClick} {...reAssignOptions.props}>{reAssignOptions.title}</AxlButton>
                        </TooltipContainer>
                      )}
                      {!canUnassign && (
                        <TooltipContainer title={isDenied ? PERMISSION_DENIED_TEXT : ''}>
                          <AxlButton disabled={isDenied} onClick={driverOptions.onClick} {...driverOptions.props}>{driverOptions.title}</AxlButton>
                        </TooltipContainer>
                      )}
                  </Fragment>
                )}
                {courier && (
                  <div>
                    <TooltipContainer title={isDenied ? PERMISSION_DENIED_TEXT : ''}>
                      <AxlButton disabled={!canUnassignDsp || isDenied} onClick={this.showUnassignDriver} {...unAssignDspOptions.props}>{unAssignDspOptions.title}</AxlButton>
                    </TooltipContainer>
                    {this.state.showUnassignDriver && <AxlModal onClose={this.hideUnassignDriver} style={styles.modalStyle} containerStyle={styles.modalContainer}>
                        <AssignmentAssign {...unAssignDspOptions} updateReason={this.updateReason()} onClose={this.hideUnassignDriver} />
                    </AxlModal>}
                  </div>
                )}
            </AxlPanel.Row>
            {!!courier && (
              <Fragment>
                { courier.settings && courier.settings.outsource && <LyftInfo scheduled={courier.settings.scheduled} provider={courier.settings.code} assignmentId={assignmentId} assignment={assignment} labels={labels} setDisableUnassignDsp={this.setDisableUnassignDsp}/> }
                  <AxlPanel.Row>
                      <AxlPanel.Col>
                          <AxlPanel.Row>
                              <AxlPanel.Col>
                                  <span style={styles.label}>{`DSP:`}</span>
                                  <span style={styles.text}>{courier.code || '?'} - {courier.company}</span>
                              </AxlPanel.Col>
                          </AxlPanel.Row>
                          <AxlPanel.Row>
                              <AxlPanel.Col>
                                  <span style={styles.label}>{`Phone No.:`}</span>
                                  <span style={styles.text}>{ courier.phone_number || '-' }</span>
                              </AxlPanel.Col>
                              <AxlPanel.Col>
                                  <span style={styles.label}>{`Email:`}</span>
                                  <span style={styles.text}>{ courier.email || '-' }</span>
                              </AxlPanel.Col>
                          </AxlPanel.Row>
                      </AxlPanel.Col>
                  </AxlPanel.Row>
                  <div style={styles.divider} />
                  <AxlPanel.Row style={{marginBottom: 5}}>
                      <AxlPanel.Col>
                          <span style={styles.label3}>{`Driver Info: `}</span>
                          <span style={styles.showLink} onClick={() => this.setState({showDriverInfo: !showDriverInfo})}>
                              {!showDriverInfo ? 'Show Info' : 'Hide Info'}
                          </span>
                      </AxlPanel.Col>
                  </AxlPanel.Row>
              </Fragment>
            )}
            {(!courier || showDriverInfo) && (
              <AxlPanel.Row>
                  <AxlPanel.Col>
                      <AxlPanel.Row>
                          <AxlPanel.Col flex={0} style={styles.driverPhotoContainer}>
                              <div style={styles.photo} onClick={this.onShowDriverProfile} >
                                  {(driverData && driverData.photo) ? <img src={driverData.photo} style={styles.driverPhoto} /> : <div style={styles.defaulDriverPhoto}/>}
                              </div>
                              {(showDriverProfile && driverData) && <AxlModal style={styles.modalDriverProfileContainer} onClose={this.onHideDriverProfile}>
                                  <DriverDetailContainer {...this.props} driverId={driverData.id} isHiddenButtonBack={true}/>
                              </AxlModal>}
                          </AxlPanel.Col>
                          <AxlPanel.Col>
                              <div style={styles.driverName}>
                                {driverData.first_name} {driverData.last_name}
                                <Tag>{driverData.tags}</Tag>
                              </div>
                              {!this.props.driverScore && <Rating emptySymbol={<img src="/assets/images/star.png" />} fullSymbol={<img src="/assets/images/star-1.png" />} />}
                              {!!this.props.driverScore && <Rating readonly={true} initialRating={Math.round(this.props.driverScore)} emptySymbol={<img src="/assets/images/star.png" />} fullSymbol={<img src="/assets/images/star-1.png" />} />}
                              <AxlPanel.Row>
                                  <AxlPanel.Col>
                                      <AxlPanel.Row>
                                          <AxlPanel.Col flex={0}><div style={styles.label}>{`Phone No.`}</div></AxlPanel.Col>
                                          <AxlPanel.Col><div style={styles.text}>{ driverData.phone_number }</div></AxlPanel.Col>
                                      </AxlPanel.Row>
                                  </AxlPanel.Col>
                                  <AxlPanel.Col>
                                      <AxlPanel.Row>
                                          <AxlPanel.Col flex={0}><div style={styles.label}>{`Status`}</div></AxlPanel.Col>
                                          <AxlPanel.Col><div style={styles.text}>{ driverData.status }</div></AxlPanel.Col>
                                      </AxlPanel.Row>
                                  </AxlPanel.Col>
                              </AxlPanel.Row>
                              <AxlPanel.Row>
                                  <AxlPanel.Col>
                                      <AxlPanel.Row>
                                          <AxlPanel.Col flex={0}><div style={styles.label}>{`AHID`}</div></AxlPanel.Col>
                                          <AxlPanel.Col><div style={styles.text}>{ driverData.id }</div></AxlPanel.Col>
                                      </AxlPanel.Row>
                                  </AxlPanel.Col>
                                  <AxlPanel.Col>
                                      <AxlPanel.Row>
                                          <AxlPanel.Col flex={0}><div style={styles.label}>{`Joined`}</div></AxlPanel.Col>
                                          <AxlPanel.Col><div style={styles.text}>{driverData.background_decision_ts ? <Moment interval={0} format={'MMM YYYY'}>{ driverData.background_decision_ts }</Moment> : '-'}</div></AxlPanel.Col>
                                      </AxlPanel.Row>
                                  </AxlPanel.Col>
                              </AxlPanel.Row>
                              <AxlPanel.Row>
                                  <AxlPanel.Col>
                                      <AxlPanel.Row>
                                          <AxlPanel.Col flex={0}><div style={styles.label}>{`D/L No.`}</div></AxlPanel.Col>
                                          <AxlPanel.Col><div style={styles.text}>{ driverData.driver_license }</div></AxlPanel.Col>
                                      </AxlPanel.Row>
                                  </AxlPanel.Col>
                              </AxlPanel.Row>
                          </AxlPanel.Col>
                      </AxlPanel.Row>
                  </AxlPanel.Col>
              </AxlPanel.Row>
            )}
            <div style={styles.divider} />
            {/* Warehouse infor */}
            <AxlPanel.Row>
                <AxlPanel.Col>
                    <span style={styles.label3}>{`Warehouse Info: `}</span>
                    <span style={styles.showLink} onClick={this.handleShowWarehouseInfo}>
                        {!assignmentStore.isShowWarehouseInfo ? 'Show Info' : 'Hide Info'}
                    </span>
                </AxlPanel.Col>
            </AxlPanel.Row>
            {assignmentStore.isShowWarehouseInfo && <AxlPanel.Row>
                <AxlPanel.Col>
                    <AxlPanel.Row>
                        <AxlPanel.Col><span style={styles.label}>{`ID:`}</span><span style={styles.text}>{ warehouseInfo ? warehouseInfo.id : 'N/A' }</span></AxlPanel.Col>
                        <AxlPanel.Col><span style={styles.label}>{`ALIAS:`}</span><span style={styles.text}>{ warehouseInfo ? warehouseInfo.alias : 'N/A' }</span></AxlPanel.Col>
                    </AxlPanel.Row>
                    <AxlPanel.Row>
                        <AxlPanel.Col><span style={styles.label}>{`ADDRESS:`}</span><span style={{...styles.text,'paddingLeft': '5px'}}>{ warehouseInfo && warehouseInfo.address ? `${warehouseInfo.address.street}, ${warehouseInfo.address.street2 && warehouseInfo.address.street2 != '' ? ` ` + warehouseInfo.address.street2 + `, ` : ''}${warehouseInfo.address.city}, ${warehouseInfo.address.state}, ${warehouseInfo.address.zipcode}` : 'N/A'}</span></AxlPanel.Col>
                    </AxlPanel.Row>
                </AxlPanel.Col>
            </AxlPanel.Row>}
            <div style={styles.divider} />
            <AxlPanel.Row>
                <AxlPanel.Col>
                    <span style={styles.label3}>{`Vehicle Info: `}</span>
                    <span style={styles.showLink} onClick={() => this.setState({showInfo: !showInfo})}>
                        {!showInfo ? 'Show Info' : 'Hide Info'}
                    </span>
                </AxlPanel.Col>
            </AxlPanel.Row>
            {this.state.showInfo && <AxlPanel.Row>
                <AxlPanel.Col>
                    <AxlPanel.Row>
                        <AxlPanel.Col><span style={styles.label}>{`MAKE:`}</span><span style={styles.text}>{ driverData.vehicle_make }</span></AxlPanel.Col>
                        <AxlPanel.Col><span style={styles.label}>{`MODEL:`}</span><span style={styles.text}>{ driverData.vehicle_model }</span></AxlPanel.Col>
                        <AxlPanel.Col><span style={styles.label}>{`COLOR:`}</span><span style={styles.text}>{ driverData.vehicle_color }</span></AxlPanel.Col>
                    </AxlPanel.Row>
                    <AxlPanel.Row>
                        <AxlPanel.Col><span style={styles.label}>{`PLATE:`}</span><span style={styles.text}>{ driverData.vehicle_license_plate }</span></AxlPanel.Col>
                        <AxlPanel.Col><span style={styles.label}>{`STATE:`}</span><span style={styles.text}>{ driverData.vehicle_license_plate_state }</span></AxlPanel.Col>
                        <AxlPanel.Col></AxlPanel.Col>
                    </AxlPanel.Row>
                </AxlPanel.Col>
            </AxlPanel.Row>}
        </div>
    }
}

export default compose(inject('assignmentStore', 'driverStore', 'userStore', 'permissionStore'), observer)(DriverInfoCard);
