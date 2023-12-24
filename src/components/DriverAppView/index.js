import React, { Fragment, useEffect, useState } from 'react'

import { Avatar, Box, Button, CircularProgress, IconButton, Typography, makeStyles } from '@material-ui/core';
import PermIdentityIcon from '@material-ui/icons/PermIdentity';
import FilterNoneIcon from '@material-ui/icons/FilterNone';
import DoneIcon from '@material-ui/icons/Done';
import ImageIcon from '@material-ui/icons/Image';
import { isEmpty } from 'lodash';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CropFreeIcon from '@material-ui/icons/CropFree';

import { getAssignmentsActive } from '../../stores/api'
import AxlTabList from '../AxlTabList';
import colors from '../../themes/colors';
import DropoffInfo from './dropoffInfo';
import ShipmentPhotos from './shipmentPhotos';
import ShipmentPins from './shipmentPins';
import { copyToClipboard } from '../../Utils/clipboard';
import AxlDialog from '../AxlDialog';

const useStyles = makeStyles((theme) => ({
  root: {
    fontFamily: 'AvenirNext',
  },
  text: {
    color: '#7b7b7b',
    fontSize: '14px',
    fontFamily: 'AvenirNext',
    marginTop: 0,

    '&__secondary': {
      color: '#626262',
    },

    '&__italic': {
      color: '#626262',
      fontStyle: 'italic',
    },
  },
  map: {
    width: '100%',
    height: '350px',
  },
  disabled: {
    opacity: 0.5,
    userSelect: 'none',
    pointerEvents: 'none',
  },
  appBar: {
    backgroundColor: 'unset',
    color: '#5a5a5a',
    fontFamily: 'AvenirNext',
    fontWeight: 600,
    boxShadow: 'none',
  },
  muiTabRoot: {
    minWidth: 10,
    padding: '12px 8px',
    marginRight: 32,
    textTransform: 'none',
    fontFamily: 'AvenirNext',
    fontWeight: 600,

    '& .MuiTab-wrapper': {
      alignItems: 'flex-start',
    },
  },
  tabPanel: {
    padding: '8px 0',
  },
  btnScan: {
    flex: '1 1 auto',
    margin: '24px 0px 0px',
    padding: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
    transition: '0.5s',
    backgroundSize: '200% auto',
    color: 'white',
    boxShadow: '0 0 20px #eee',
    borderRadius: 30,
    flex: 1,
    backgroundColor: '#887fff',
    backgroundImage: 'linear-gradient(to right, #887fff 0%, #6af4ff 51%)',

    "&:hover": {
      backgroundPosition: 'center',
    }
  }
}));

function DriverAppView({shipmentId, driverId, assignmentId}) {
  const [isLoading, setIsLoading] = useState(false);
  const [simulate, setSimulate] = useState({});
  const [tabs, setTabs] = useState([]);
  const [selectedTab, setSelectedTab] = useState("info");
  const [isCopied, setIsCopied] = useState(false);
  const [isZoomOut, setIsZoomOut] = useState(false);
  const [isExpandMore, setIsExpandMore] = useState(true);
  const [message, setMessage] = useState("");
  const [isOpenScanner, setIsOpenScanner] = useState(false);
  const classes = useStyles();

  useEffect(() => {
    setIsLoading(true);
    getAssignmentsActive(driverId)
      .then(res => {
        if(res.ok) {
          const { data } = res;

          if(!assignmentId || isEmpty(data.assignment) || assignmentId !== data.assignment.id) {
            setSimulate({});
            setMessage("Driver is actively delivering another assignment.")
            return;
          }

          if(isEmpty(data)) {
            setSimulate({});
            setMessage("No assignments activated or shipment data not found.");
            return;
          }

          const stop = data.stops.find(f => f.stop && f.stop.shipment_id === shipmentId && f.stop.type === "DROP_OFF") || {};
          const shipment_map = data.shipment_map[`SH_${shipmentId}`] || {};
          const photos = stop && [...(stop.verified_photos || []), ...(stop.preferred_dropoff_photos || [])]
          const pins = stop && stop.location_pins && stop.location_pins || [];
          const clientInfo = data.client_map[`CL_${shipment_map.client_id}`] || {};
          const addressType = stop && data.address_type_map[stop.address_type];
          const geocodeAddressMap = data.geocode_address_map || {};
          setSimulate({
            stop,
            shipment_map,
            photos,
            clientInfo,
            addressType,
            pins,
            stop,
          })

          setTabs([
            { 
              label: 'INFO', 
              value: 'info', 
              tabPanelComponent: <DropoffInfo stopInfo={stop} shipmentMap={shipment_map} geocodeAddressMap={geocodeAddressMap}/>, 
            },
            photos && photos.length > 0 && { 
              label: `PHOTOS (${photos && photos.length})`, 
              value: 'photos', 
              tabPanelComponent: <ShipmentPhotos photos={photos}/>, 
            },
            pins && pins.length > 0 && { 
              label: `PINS (${pins && pins.length})`, 
              value: 'pins', 
              tabPanelComponent: <ShipmentPins pins={pins} stopInfo={stop} isZoomOut={isZoomOut} setIsZoomOut={(val) => setIsZoomOut(val)}/>, 
            }
          ].filter(Boolean))
        }
        else {
          setSimulate({});
          setMessage("No assignments activated or shipment data not found.")
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  const handleChangeTab = (_, tab) => {
    setSelectedTab(tab);
  };

  const getMapUrl = () => {
    const {lat, lng, street, city, state, zipcode} = simulate && simulate.shipment_map && simulate.shipment_map.dropoff_address
    return `https://www.google.com/maps/place/${street},${city},${state} ${zipcode}/@${lat},${lng},15z?entry=ttu`
  }

  const handleCopy = async () => {
    setIsCopied(true);
    
    if (navigator && navigator.clipboard) {
      await navigator.clipboard.writeText(getMapUrl());
    } else {
      copyToClipboard(getMapUrl());
    }

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }

  const handleViewMap = () => {
    window.open(getMapUrl(), '_blank', 'noopener,noreferrer')
  }

  if(isLoading) return <Box display={'flex'} justifyContent={'center'} alignItems={'center'}><CircularProgress size={24}/></Box>

  if(isEmpty(simulate)) return <Box display={'flex'} justifyContent={'center'} alignItems={'center'} color={'#d63031'}>{message}</Box>
  
  return (
    <Box bgcolor={'#000'} p={1} borderRadius={25}>
      <Box bgcolor={'#fff'} borderRadius={20} p={1} height={'calc(100vh - 200px)'} maxHeight={700} pt={2.5} overflow={'auto'} display={'flex'} flexDirection={'column'}>
        {simulate && simulate.addressType && (
          <Box display={'flex'} justifyContent={'flex-end'}>
            <Box display={'inline-block'} style={{transform: 'skewX(-10deg)'}} bgcolor={'#6C62F5'} mb={1} p={0.5}>
              <Box style={{transform: 'skewX(10deg)'}} color={'#fff'} fontSize={11} fontFamily={'AvenirNext'}>{simulate.addressType}</Box>
            </Box>
          </Box>
        )}
        <Box p={2} borderRadius={4} border={'1px solid #0000003b'} mb={2} display={'flex'} justifyContent={'space-between'}>
          {simulate.shipment_map && simulate.shipment_map.dropoff_address && 
            <Box>
              <Typography style={{fontWeight: 700, fontSize: '16px'}}>{simulate.shipment_map.dropoff_address.street}</Typography>
              <Typography style={{fontSize: '16px'}}>{simulate.shipment_map.dropoff_address.city}, {simulate.shipment_map.dropoff_address.state} {simulate.shipment_map.dropoff_address.zipcode}</Typography>
            </Box>
          }
          <Box display={'flex'} alignItems={'stretch'} style={{gap: 8}}>
            <Avatar src="/assets/images/apple_map.png" variant="rounded" style={{cursor: 'pointer'}} onClick={handleViewMap}/>
            <Button
              variant="outlined"
              color="default"
              startIcon={isCopied ? <DoneIcon htmlColor='#4abc4e'/> : <FilterNoneIcon />}
              size='small'
              onClick={handleCopy}
            >
              {isCopied ? 'Copied' : 'Copy'}
            </Button>
          </Box>
        </Box>

        <Box display={'flex'} flexDirection={'column'} py={1} px={2} borderRadius={4} border={'1px solid #0000003b'}>
          <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} mb={0.5}>
            <Box color={'#4A4A4A'} fontWeight={700} display={'inline-block'}>{simulate.stop && simulate.stop.label} </Box>
            <Box display={'flex'} alignItems={'center'}>
              {simulate.shipment_map && simulate.shipment_map.dropoff_address && 
                <Typography style={{fontSize: '12px', fontWeight: 500}}>{simulate.shipment_map.dropoff_address.street2}</Typography>
              }
              <IconButton onClick={() => setIsExpandMore(!isExpandMore)} style={{width: 24, height: 24, marginLeft: 8,}}>
                {isExpandMore ? <ExpandLessIcon /> : <ExpandMoreIcon/>}
              </IconButton>
            </Box>
          </Box>
          <Box display={'flex'} justifyContent={'space-between'}>
            <Box display={'flex'} alignItems={'center'} style={{gap: 8}}>
              <PermIdentityIcon fontSize='small' style={{marginTop: -4}}/>
              <Box fontWeight={700}>{simulate.shipment_map && simulate.shipment_map.customer && simulate.shipment_map.customer.name}</Box>
            </Box>

            {simulate && simulate.clientInfo && (
              <Box display={'flex'} alignItems={'center'} style={{gap: 8}}>
                <Typography>{simulate.clientInfo.company}</Typography>

                <Avatar src={simulate.clientInfo.logo_url} style={{width: 30, height: 30}}>
                  <ImageIcon />
                </Avatar>
              </Box>
            )}
          </Box>
        </Box>

        <Box flex={1}>
          {isExpandMore && (
            <AxlTabList
              variant='scrollable'
              value={selectedTab}
              onChange={handleChangeTab}
              tabList={tabs}
              TabIndicatorProps={{ style: { background: colors.periwinkleSecondary, height: 3, }}}
              className={{
                appBar: classes.appBar,
                tabPanel: classes.tabPanel,
              }}
              classes={{
                tab: {root: classes.muiTabRoot }
              }}
            />
          )}
        </Box>

        <Box position={'sticky'} left={0} bottom={0} display={'flex'} zIndex={1}>
          <Button className={classes.btnScan} onClick={() => setIsOpenScanner(true)}>
            <CropFreeIcon />
          </Button>
        </Box>

        {isZoomOut && <AxlDialog
          isOpen={isZoomOut}
          childrenTitle={"Location Pins"}
          children={<ShipmentPins pins={simulate && simulate.pins || []} stopInfo={simulate && simulate.stop || {}} isZoomOut={isZoomOut}/>}
          handleClose={() => setIsZoomOut(false)}
        />}

        {isOpenScanner && (
          <AxlDialog
            maxWidth='xs'
            isOpen={isOpenScanner}
            children={<Box display={'flex'} justifyContent={'center'}>Driver will need to scan shipment label to dropoff</Box>}
            handleClose={() => setIsOpenScanner(false)}
            dividers={false}
            isShowClose={false}
            childrenAction={
              <Box>
                <Button variant='outlined' color='default' onClick={() => setIsOpenScanner(false)}>Cancel</Button>
              </Box>
            }
          />
        )}
      </Box>

    </Box>
  )
}

export default DriverAppView