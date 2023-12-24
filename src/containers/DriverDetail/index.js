import React, { Fragment, useEffect, useState } from 'react'
import { Backdrop, Box, Button, CircularProgress, Dialog, Drawer, IconButton, Tooltip } from '@material-ui/core';
import _ from 'lodash';
import moment from 'moment-timezone';
import Rating from 'react-rating';
import { useParams, matchPath } from 'react-router-dom';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import HistoryIcon from '@material-ui/icons/History';
import { toast } from 'react-toastify';

import * as E from '../../components/DriverProfileInformation/styles';
import { useStyles } from './styles'
import colors from '../../themes/colors';
import MetricTabPanel from '../MetricTabPanel';
import DriverProfileProbation from '../../components/DriverProfileRoutingTab/DriverProfileProbation';
import DriverProfileRoutingTab from '../../components/DriverProfileRoutingTab';
import DriverProfileAppeal from '../../components/DriverProfileRoutingTab/DriverProfileAppeal';
import { DriverProfilePointingSystemHistoryList } from '../../components/DriverProfileRoutingTab/DriverProfilePerformance';
import Tag from '../../components/Driver/Tag';
import PersonalInfo from '../../components/PersonalInfo';
import VehicleInfo from '../../components/VehicleInfo';
import DialogPersonalInfo from '../../components/DialogPersonalInfo';
import DialogVehicleInfo from '../../components/DialogVehicleInfo';
import DriverDetailsInfo from '../../components/DriverDetailsInfo';
import DriverLicenseInfo from '../../components/DriverLicenseInfo';
import DialogDriverDetailsInfo from '../../components/DialogDriverDetailsInfo';
import DialogDriverLicenseInfo from '../../components/DialogDriverLicenseInfo';
import HistoryEventDriver from '../../components/HistoryEventDriver';
import { toastMessage } from '../../constants/toastMessage';
import AxlTabList from '../../components/AxlTabList';

function DriverDetailContainer(props) {
    const [driverInfo, setDriverInfo] = useState(null);
    const [suspensionsStatus, setSuspensionsStatus] = useState(false);
    const [tabValue, setTabValue] = useState('metrics');
    const [tabValueInfo, setTabValueInfo] = useState('driver-details-info');
    const [tabVehicleInfo, setTabVehicleInfo] = useState('vehicle-1');
    const [isEditInfo, setIsEditInfo] = useState(false);
    const [bgCheckRunnable, setBgCheckRunnable] = useState({});
    const [isOpenHistory, setIsOpenHistory] = useState(false);
    const [offset, setOffset] = useState(0);

    const params = useParams();
    const classes = useStyles({...props, offset});
    const [isLoading, setIsLoading] = useState([]);
    const { driverStore, driverId, userStore } = props;
    const id = params.id || driverId;
    const today = moment();
    const start = today.startOf('isoweek').format('YYYY-MM-DD');
    const end = today.endOf('isoweek').format('YYYY-MM-DD');
    const matchDrivers = matchPath(props.location && props.location.pathname, {
        path: `/drivers/:id`,
        exact: true,
        strict: false
    });
    const [isChecking, setIsChecking] = useState(false);
    const { isHr, isSuperAdmin, isDriverManager, isDriverAdmin } = userStore;
    const canEdit = isSuperAdmin || isDriverAdmin;
    const ignoreTab = ['driver-license-info', 'vehicle-info', 'personal-info']

    useEffect(() => {
        const onScroll = () => setOffset(window.pageYOffset);
        window.removeEventListener('scroll', onScroll);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const callAPIBgCheckRunnable = (isDisabledLoading) => {
        driverStore.backgroundCheckRunnable(id).then(res => {
            if(res.ok) {
                setBgCheckRunnable(res.data);
            }
            else {
                setBgCheckRunnable({});
            }
            !isDisabledLoading && setIsLoading(prev => [...prev, 2]);
        })
    }

    const callAPIGetDriverInfo = (isDisabledLoading) => {
        driverStore.getDriverInfoV2(id).then(res => {
            if(res.ok) {
                setDriverInfo(res.data);
            }
            else {
                setDriverInfo(null);
            }
            !isDisabledLoading && setIsLoading(prev => [...prev, 1]);
        })
    }

    useEffect(() => {
        setIsLoading([]);
        callAPIGetDriverInfo(false);
        callAPIBgCheckRunnable(false);
    }, [id]);

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleChangeInfo = (event, newValue) => {
        setTabValueInfo(newValue);
    };

    const handleChangeVehicleInfo = (event, newValue) => {
        setTabVehicleInfo(newValue);
    };

    const suspensionsUpdate = (val) => {
        setSuspensionsStatus(val);
    }

    if(isLoading.length !== 2) return (
      <Box mt={5}>
          <CircularProgress color='primary' thickness={4}/>
      </Box>
    )

    if (!driverInfo) return null;

    const handleEditInfo = (val) => {
        setIsEditInfo(val);
    }

    const handleUpdateData = (data, section) => {
        if(!data) return;
        callAPIBgCheckRunnable(true);
        switch (section) {
            case 'personal':
                const {street, street2, city, state, zipcode, ...otherDataPersonal} = data;
                const home_address = { street, street2, city, state, zipcode };

                setDriverInfo(prev => ({
                    ...prev,
                    home_address,
                    ...otherDataPersonal
                }))
            break;

            case 'details':
            case 'license':
                setDriverInfo(prev => ({
                    ...prev,
                    ...data
                }))
            break;

            case 'vehicle':
                if(!driverInfo || !driverInfo.vehicles || !driverInfo.vehicles.length === 0) return;

                const vehicles = driverInfo.vehicles.map((vehicle, idx) => {
                    if(idx === +tabVehicleInfo.split('-')[1] - 1) {
                        const {year, sub_model, model, make, ...otherDataVehicle} = data;
                        vehicle.car = {year, submodel: sub_model, model, make};
                        return {
                            ...vehicle,
                            ...otherDataVehicle
                        }
                    }
                    return vehicle;
                })
                setDriverInfo(prev => ({
                    ...prev,
                    vehicles,
                }))
            break;
        }

    }

    const renderDialogContent = () => {
        switch (tabValueInfo) {
            case 'personal-info':
                return <DialogPersonalInfo
                            handleClose={() => handleEditInfo(false)}
                            title="Edit Personal Info"
                            data={driverInfo}
                            driverStore={driverStore}
                            updateData={(data) => handleUpdateData(data, 'personal')} />

            case 'driver-details-info':
                return <DialogDriverDetailsInfo
                            handleClose={() => handleEditInfo(false)}
                            title="Edit Driver Details Info"
                            data={driverInfo}
                            driverStore={driverStore}
                            updateData={(data) => handleUpdateData(data, 'details')}
                        />
            case 'driver-license-info':
                return <DialogDriverLicenseInfo
                            handleClose={() => handleEditInfo(false)}
                            title="Edit Driver License Info"
                            data={driverInfo}
                            driverStore={driverStore}
                            updateData={(data) => handleUpdateData(data, 'license')}
                        />
            case 'vehicle-info':
                if ((!driverInfo || driverInfo.vehicles.length === 0) && isEditInfo) {
                    setIsEditInfo(false);
                    toast.warn('No Vehicle Info to Edit', {containerId: 'main'});
                    return;
                }
                return <DialogVehicleInfo
                            handleClose={() => handleEditInfo(false)}
                            title={`Edit Vehicle ${+tabVehicleInfo.split("-")[1]} Info`}
                            data={driverInfo.vehicles[+tabVehicleInfo.split('-')[1] - 1]}
                            driverStore={driverStore}
                            updateData={(data) => handleUpdateData(data, 'vehicle')}
                            driverID={driverInfo.id}
                            vehicleNumber={+tabVehicleInfo.split("-")[1]}
                            driverInfo={driverInfo}
                        />
        }
    }

    const handleHistoryIcon = (val) => {
        setIsOpenHistory(val);
    }

    const handleBackgroundCheckRun = () => {
        setIsChecking(true);
        driverStore.backgroundCheckRun(driverInfo.id).then(res => {
            if(res.ok) {
              callAPIGetDriverInfo(true);
              callAPIBgCheckRunnable(true);
              toast.success('Submitted Driver Info successfully!', {containerId: 'main'});
            }
            else {
              const {errors, message} = res.data;
              if(errors) {
                toast.error(errors.join('\n\n'), {containerId: 'main'});
                return;
              }
              if(message) {
                toast.error(message.split('\r\n').join('\n\n'), {containerId: 'main'});
                return;
              }
              toast.error(toastMessage.ERROR_UPDATING, {containerId: 'main'});
            }
        }).finally(() => setIsChecking(false));
    }

    const checkPrimaryVehicle = (vehicle) => {
        return vehicle.primary_driver_ids && vehicle.primary_driver_ids.length > 0 && vehicle.primary_driver_ids.includes(+id)
    }

    const outerTabList = [
      {
        label: "Driver Details Info",
        value: 'driver-details-info',
        tabPanelComponent: <DriverDetailsInfo driverInfo={driverInfo} matchDrivers={matchDrivers}/>,
      },
      {
        label: "Driver License Info",
        value: 'driver-license-info',
        tabPanelComponent: <DriverLicenseInfo driverInfo={driverInfo} matchDrivers={matchDrivers}/>,
      },
      {
        label: "Vehicle Info",
        value: 'vehicle-info',
        tabPanelComponent: driverInfo.vehicles && driverInfo.vehicles.length < 2 
          ? <Box display='flex' flex={1} flexDirection={'column'} style={{gap: '8px'}}>
              {checkPrimaryVehicle(driverInfo && driverInfo.vehicles && driverInfo.vehicles.length > 0 && driverInfo.vehicles[0]) && <Box color={'#887fff'} fontSize={13} textAlign={'right'}>(Primary Vehicle)</Box>}
              <VehicleInfo vehicleInfo={driverInfo.vehicles[0]} driverInfo={driverInfo} matchDrivers={matchDrivers} driverID={id} isDisplay={true}/>
            </Box>
          : 
          <Box display={'flex'} flexDirection='column' flex={1} position={'relative'}>
            <AxlTabList
              variant='scrollable'
              value={tabVehicleInfo}
              onChange={handleChangeVehicleInfo}
              tabList={driverInfo.vehicles.map((_, idx) => ({
                value: `vehicle-${idx + 1}`,
                label: `Vehicle ${idx + 1}`,
                tabPanelComponent: <Fragment>
                  {checkPrimaryVehicle(driverInfo.vehicles[+tabVehicleInfo.split('-')[1] - 1]) && <Box color={'#887fff'} position={'absolute'} fontSize={13} right={8} top={16}>(Primary Vehicle)</Box>}
                  <VehicleInfo vehicleInfo={driverInfo.vehicles[+tabVehicleInfo.split('-')[1] - 1]} matchDrivers={matchDrivers} driverInfo={driverInfo} driverID={id} isDisplay={false}/>
                </Fragment>
              }))}
              TabIndicatorProps={{ style: { background: colors.periwinkleSecondary, height: 3, }}}
              className={{
                appBar: classes.appBar,
                tabs: classes.tabsVehicleInfo,
                tabPanel: classes.tabPanelVehicle,
              }}
              classes={{
                tab: {root: classes.muiTabRoot }
              }}
            />
          </Box>,
      },
      {
        label: "Personal Info",
        value: 'personal-info',
        tabPanelComponent:<PersonalInfo driverInfo={driverInfo} matchDrivers={matchDrivers}/>,
      },
    ]

    const tabLabelVertical = [
      {
        label: 'Metrics',
        value: 'metrics',
        tabPanelComponent: <MetricTabPanel {...props} driver={driverInfo}/>
      },
      {
        label: 'Warnings',
        value: 'warnings',
        tabPanelComponent: <DriverProfileProbation {...props} driver={driverInfo} update={suspensionsUpdate}/>
      },
      {
        label: 'Active Routes',
        value: 'active-routes',
        tabPanelComponent: <DriverProfileRoutingTab.Active driver={driverInfo} {...props} />
      },
      {
        label: 'Pending Routes',
        value: 'pending-routes',
        tabPanelComponent: <DriverProfileRoutingTab.Pending driver={driverInfo}/>
      },
      {
        label: 'Past Routes',
        value: 'past-routes',
        tabPanelComponent: <DriverProfileRoutingTab.Past driver={driverInfo}/>
      },
      {
        label: 'Driver Activity',
        value: 'driver-activity',
        tabPanelComponent: <DriverProfileRoutingTab.Activity driver={driverInfo}/>
      },
      {
        label: 'Payment',
        value: 'payment',
        tabPanelComponent: <DriverProfileRoutingTab.Payment driver={driverInfo}/>
      },
      {
        label: 'Appeals',
        value: 'appeals',
        tabPanelComponent: <DriverProfileAppeal driver={driverInfo} />
      },
      {
        label: 'History',
        value: 'history',
        tabPanelComponent: <DriverProfilePointingSystemHistoryList getPoint={driverStore.getPointingAssignmentDetail} getPointAssignments={() => driverStore.getPointingAssignments(id, start, end)} />
      },
    ]

    return (
        <Fragment>
            <Backdrop open={isChecking} style={{zIndex: 99999}}>
                <CircularProgress color="primary" size={40} thickness={2}/>
            </Backdrop>
            <div style={{minHeight: '200px', backgroundColor: `${colors.white}`, marginTop: '10px'}}>
                <div style={{padding: '20px'}}>
                    <Box display="flex">
                        {!props.isHiddenButtonBack && (
                          <Box width={210}>
                              <Button fullWidth variant='outlined' onClick={() => props.history.push("/drivers")} startIcon={<ArrowBackIosIcon />} classes={{startIcon: classes.startIcon}}>
                                  Back to Drivers Tab
                              </Button>
                          </Box>
                        )}
                        <Box flex={1} style={{marginLeft: '24px'}}>
                            <Box display="flex" flexDirection="row" alignItems="flex-start" lineHeight={'normal'}>
                                <E.DriverName style={{textTransform: 'uppercase'}}>{`${_.get(driverInfo, 'first_name', '')} ${_.get(driverInfo, 'last_name', '')}`}</E.DriverName>
                                <Box display='flex' alignItems='center'>
                                    <E.DriverId>{`(AHID: #${driverInfo.id})`}</E.DriverId>
                                    <Tag>{driverInfo.tags}</Tag>
                                </Box>
                            </Box>
                            <Box display="flex" justifyContent="flex-start">
                                <Rating readonly={true} initialRating={Math.round(driverInfo.stars)} emptySymbol={<img src="/assets/images/star-2.png" />} fullSymbol={<img src="/assets/images/star-3.png" />} />
                            </Box>
                        </Box>
                        <Box>
                            <E.LabelStatus>{`Status: `}<E.Status>{driverInfo.status}</E.Status></E.LabelStatus>
                        </Box>
                    </Box>
                    <Box display="flex">
                        <Box mt={2}>
                            <Box width={210} height={200} bgcolor="#d8d8d8" textAlign='center'>
                                {driverInfo.photo && <img src={driverInfo.photo} style={{width: '210px', height: '200px'}}/>}
                            </Box>
                            <E.DriverSince>{`Driver since: ${driverInfo.driver_since}`}</E.DriverSince>
                            {matchDrivers && (
                                <Tooltip title={bgCheckRunnable.message} arrow>
                                    <span>
                                        <Button variant='outlined' color='primary' style={{marginTop: '8px'}} disabled={!bgCheckRunnable.runnable || !(isSuperAdmin || isHr || isDriverManager)} onClick={handleBackgroundCheckRun}>Re-run Background Check</Button>
                                    </span>
                                </Tooltip>
                            )}
                        </Box>
                        <Box position={'relative'} display={'flex'} flex={1}>
                            <Box display={'flex'} flexDirection="column" flex={1}>
                                <AxlTabList
                                  value={tabValueInfo}
                                  onChange={handleChangeInfo}
                                  tabList={canEdit ? outerTabList : outerTabList.filter(ft => !ignoreTab.includes(ft.value))}
                                  TabIndicatorProps={{ style: { background: colors.periwinkleSecondary, height: 3, }}}
                                  className={{
                                    appBar: classes.appBar,
                                    tabs: classes.tabsInfo,
                                    tabPanel: classes.tabPanel,
                                  }}
                                  classes={{
                                    tab: {root: classes.muiTabRoot }
                                  }}
                                />
                            </Box>
                            {canEdit && (
                              <Box position={'absolute'} top={5} right={0} style={{gap: '8px'}} display='flex' zIndex={1199}>
                                  <IconButton classes={{root: classes.btnHistoryIcon}} onClick={() => handleHistoryIcon(true)}>
                                      <HistoryIcon/>
                                  </IconButton>
                                  {matchDrivers && <Button variant='outlined' onClick={() => handleEditInfo(true)}>Edit</Button>}
                              </Box>
                            )}
                        </Box>
                        
                    </Box>
                </div>
                <Box display={"flex"}>
                  <AxlTabList
                    orientation="vertical"
                    variant="scrollable"
                    value={tabValue}
                    onChange={handleChange}
                    tabList={tabLabelVertical}
                    className={{
                      appBar: classes.appBarVertical,
                      tabPanel: classes.tabPanelVertical,
                    }}
                    classes={{
                      tab: {root: classes.tab }
                    }}
                  />
                </Box>
            </div>

            <Dialog fullWidth maxWidth="md" open={isEditInfo}>
                {renderDialogContent()}
            </Dialog>

            <Drawer anchor={'right'} open={isOpenHistory} onClose={() => handleHistoryIcon(false)} 
                classes={{paper: matchDrivers && classes.paperHistory}} 
                style={{zIndex: !matchDrivers ? '99999' : '1300'}}
                BackdropProps={{ invisible: true }}
            >
                <HistoryEventDriver driverID={driverInfo.id} driverStore={driverStore} handleClose={() => handleHistoryIcon(false)} title="Driver Profile - Edit History"/>
            </Drawer>
        </Fragment>
    )
}

export default DriverDetailContainer
