import React, { useEffect, useRef, useState } from 'react';

import {
  Box, CircularProgress, TextareaAutosize
} from '@material-ui/core';
import ListAltIcon from '@material-ui/icons/ListAlt';
import ToggleButton from '@material-ui/lab/ToggleButton';
import { AxlButton, AxlDateInput, AxlMultiSelect, STATUS_COLOR_CODE } from 'axl-reactjs-ui';
import DeckGL, { IconLayer, PathLayer } from 'deck.gl';
import polyline from 'google-polyline';
import produce from 'immer';
import _, { cloneDeep } from 'lodash';
import moment from 'moment';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import { toast } from 'react-toastify';
import WebMercatorViewport from 'viewport-mercator-project';

import MARKERS from '../../containers/AssignmentListMap/data/dots.svg';
import useSearchParams from '../../hooks/useSearchParams';
import { api, assignmentAddShipment, redeliveryMultipleV2, searchNearestAssignment } from '../../stores/api';
import ShipmentList from '../AddRedelivery/ShipmentList';
import styles from '../AddRedelivery/styles';
import { COLOR_PALETE, INITIAL_VIEW_STATE, iconMapping, mapStyle, stringToNumber } from './constants';
import { useStyles } from './styles';

const AssignmentDetailPopup = ({ assignment, shipment, addShipments, clientList, bypassClientIds }) => {
  const listClientExclude = clientList.specialty.concat(clientList.ondemand).filter((clientID) => bypassClientIds.length>0 && bypassClientIds.includes(clientID));
  let isDisabledAdd = !shipment.id;
  if(assignment.client_ids) {
    assignment.client_ids.forEach(c => {
      if (listClientExclude.includes(c)) {
        isDisabledAdd = true;
        return;
      }
    });
  }
  const statusColor = assignment.status ? STATUS_COLOR_CODE[assignment.status] : STATUS_COLOR_CODE['PENDING'];

  return (
    <div style={{ fontSize: '13px', width: '240px', textAlign: 'center', margin: 0 }}>
      <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Assignment {assignment.label}</div>
      <div style={styles.row}>
        <div style={styles.col_left}>Assignment ID:</div>
        <div style={styles.col_right}>{assignment.id}</div>
      </div>
      <div style={styles.row}>
        <div style={styles.col_left}>Shipment ID:</div>
        <div style={styles.col_right}>{shipment.id}</div>
      </div>
      <div style={styles.row}>
        <div style={styles.col_left}>Box Count:</div>
        <div style={styles.col_right}>{assignment.shipment_count || 'N/A'} / {assignment.max_box || 'N/A'}</div>
      </div>
      <div style={styles.row}>
        <div style={styles.col_left}>Volumic:</div>
        <div style={styles.col_right}>{assignment.volumic || 'N/A'} / {assignment.max_volumic || 'N/A'}</div>
      </div>
      <div style={styles.row}>
        <div style={styles.col_left}>Client</div>
        <div style={{ ...styles.col_right, ...styles.client_name }}>{assignment.client_name && assignment.client_name.join(', ')}</div>
      </div>
      <div style={styles.row}>
        <div style={styles.col_left}>Status:</div>
        <div style={{ ...styles.col_right, color: statusColor }}> {assignment.status}</div>
      </div>
      <div>
        <AxlButton
          disabled={isDisabledAdd}
          compact={true}
          style={{ width: '160px' }}
          onClick={() => addShipments(assignment, shipment)}
        >
          ADD
        </AxlButton>
      </div>
    </div>
  );
};

const AddRedeliveryV2 = () => {
  const classes = useStyles();
  const [viewport, setViewport] = useState({
    latitude: 33.851029206367905,
    longitude: -118.38935852050781,
    zoom: 11,
  });
  const exAssignmentRef= useRef('');
  const [layers, setLayers] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [dateSelect, setDate] = useState(Date.now() + 60 * 60 * 24 * 1000);
  const [assignmentPopup, setAssignmentPopup] = useState(false);
  const [shipmentInput, setShipmentInput] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const bypassClientIds = searchParams.get('add_client_ids') != null ? searchParams.get('add_client_ids').split(",").map(s => stringToNumber(s)) : [];
  const [clientIdsParam, setClientIdsParam] = useState([]);
  const [maxDistance, setMaxDistance] = useState(2);
  const [clientOptions, setClientOptions] = useState([]);
  const [regions, setRegions] = useState([]);
  const [clientMap, setClientMap] = useState({});
  const [clientList, setClientList] = useState([]);
  const [regionList, setRegionList] = useState([]);
  const [openShipmentPopup, setOpenShipmentPopup] = useState(false);
  const [shipmentData, setShipmentData] = useState([]);
  const [shipmentSelected, setShipmentSelected] = useState({});
  const [isMapLoading, setMapLoading] = useState(false);
  const [assignmentLocationMap, setAssignmentLocationMap] = useState({});
  const [points, setPoints] = useState([]);
  const [assignmentList, setAssignmentList] = useState([]);
  const [adding, setAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fitBoundary = boundary => {
    if (!boundary) return;
    const isTooSmall = boundary[1][0] - boundary[0][0] < 0.0004;
    const c = { longitude: boundary[0][1], latitude: boundary[0][0], zoom: 2 };
    const viewportWeb = new WebMercatorViewport(viewport);
    boundary = boundary.slice().map(b => b.slice());
    const renderViewport = viewportWeb.fitBounds(boundary, { padding: 10, offset: [0, -100] });
    const { longitude, latitude, zoom } = isTooSmall ? c : renderViewport;
    setViewport({ ...viewport, longitude, latitude, zoom, transitionDuration: 500 });
  };

  const handleClickShipment = shipment => {
    if (!shipment.lng || !shipment.lat) {
      return;
    }
    setShipmentSelected(shipment);
    fitBoundary([
      [shipment.lng - 0.02, shipment.lat - 0.02],
      [shipment.lng + 0.02, shipment.lat + 0.02],
    ]);
  };

  const renderMarkers = assignments => {
    if (!assignments) return [];
    const data = assignments
      .filter(a => a.path)
      .map((a) => ({
        path: a.path.slice().map(l => l.slice()).map(l => [l[1], l[0]]),
        label: a.label,
        color: COLOR_PALETE[a.id % COLOR_PALETE.length],
        id: a.id,
      }));

    const pathLayer = new PathLayer({
      id: 'path-layer',
      data: data,
      widthScale: 5,
      rounded: true,
      widthMinPixels: 2,
      getPath: d => d.path,
      getColor: d => d.color,
      getWidth: d => 1,
    });

    const dropoffMarkers = assignments
      .slice()
      .filter(a => a.path)
      .flatMap(p => {
        return p.path.slice().map((d, i) => {
          return {
            location: _.reverse(d.slice()),
            assignment: p,
            size: 18,
            icon: 'white',
          };
        });
      });

    const dropoffIconlayer = new IconLayer({
      id: 'dropoff-icon-layer',
      data: dropoffMarkers,
      pickable: true,
      iconAtlas: MARKERS,
      iconMapping: iconMapping,
      getIcon: d => d.icon,
      sizeScale: 1,
      opacity: 1,
      visible: true,
      getPosition: d => d.location,
      getSize: d => d.size,
      onClick: info => {
        const { object } = info;
        if (object && object.assignment) setAssignmentPopup(object);
        if (!object) setAssignmentPopup(null);
      },
    });
    setLayers([pathLayer, dropoffIconlayer]);
  };

  const processAssignments = (assignments, assignmentSession, clientIdsParam) => {
    let processed = assignments.map(a => ({
      ...a,
      path: a.path ? polyline.decode(a.path) : '',
      client_name: a.client_ids ? a.client_ids.map((cid) => clientMap[cid]).filter(Boolean) : [],
      pickedup: a.dropoff_status && a.dropoff_status.split('|').filter(a => a === 'PS').length
    }));
    const excludeIds = exAssignmentRef.current.value;
    const arr = excludeIds.split(/[^\dA-z]+/).map(s => s.toUpperCase());
    let finalAssignmentIds = assignmentSession;
    if (excludeIds && arr.length > 0) {
      finalAssignmentIds = assignmentSession.filter(a => !arr.includes(a.toString()));
      processed = processed.filter(a => a.label && !arr.includes(a.label.split("-")[0]));
    }
    if (clientIdsParam != null && clientIdsParam.length > 0) {
      processed = processed.filter((a) => (a.status !== "COMPLETED") && !a.pickedup &&  a.client_ids.filter(id => clientIdsParam.includes(id)));
    } else {
      processed = processed.filter((a) => (a.status !== "COMPLETED") && !a.pickedup && finalAssignmentIds.includes(a.id));
    }
    renderMarkers(cloneDeep(processed));

    return cloneDeep(processed);
  };

  const addShipments = (assignment, shipment) => {
    if (!assignment.id || !shipment.id) {
      console.log('need input shipment or assignment');
      return;
    }
    const assignmentId = assignment.id;
    const shipmentId = shipment.id;
    assignmentAddShipment(assignmentId, shipmentId, true).then(response => {
      if (response.ok) {
        const newShipmentData = produce(shipmentData, draft => {
          const dataIndex = draft.findIndex(d => d.id === shipmentId);
          if (dataIndex > -1) {
            draft[dataIndex].assignmentId = assignmentId;
            draft[dataIndex].added = true;
          }
        });
        setShipmentData(newShipmentData);
      } else {
        const newShipmentData = produce(shipmentData, draft => {
          const dataIndex = draft.findIndex(d => d.id === shipmentId);
          if (dataIndex > -1) {
            draft[dataIndex].added = false;
          }
        });
        setShipmentData(newShipmentData);
        window.alert('Failed to add shipment: ' + response.data.message + ', shipmentId: ' + shipmentId);
      }
      setAssignmentPopup(false);
    });
  };

  const setClientIds = (selectClient) => {
    setClientIdsParam(selectClient.map(c => c.value));
  }

  const getAssignmentIdsInSession = async (date) => {
    try{
      const result = await api.get(`/sortation/sort-session/assignments?date=${date}`);
      if(result.ok && result.data) {
        return result.data;
      } else {
        return [];
      }
    } catch (e) {
      return [];
    }
  }

  const calculatePointsAndMaps = (assignments) => {
    let calculatedPoints = [];
    let calculatedMaps = {};

    for (let i = 0; i < assignments.length; i++) {
      const assignment = assignments[i];

      if (assignment.path && assignment.path.length > 0) {
        calculatedPoints = calculatedPoints.concat(assignment.path);

        for (let j = 0; j < assignment.path.length; j++) {
          calculatedMaps[assignment.path[j]] = assignment.id;
        }
      }
    }

    return { calculatedPoints, calculatedMaps };
  }

  const loadAssignments = date => {
    if (regions.length === 0) {
      return toast.error('Please choose at least 1 region!', {
        containerId: 'main',
        position: toast.POSITION.TOP_CENTER,
        hideProgressBar: true,
      });
    }

    setMapLoading(true);
    const regionCodes = regions.map((region) => region.value).join(',');
    const startDate = moment(date).format('YYYY-MM-DD');
    const boxCount = Number(searchParams.get('plus_bc'));
    const plusBoxCount = Number.isNaN(boxCount) ? 0 : boxCount;

    api
      .get(`/redelivery/list-by-date`, {
        order: '-id',
        limit: 3000,
        region_codes: regionCodes,
        wh: '',
        date: startDate,
        clients: clientIdsParam.length > 0 ? clientIdsParam.join(',') : clientList.commingle.join(','),
        requested: '',
        plus_bc: plusBoxCount,
      })
      .then(async (response) => {
        if (response.ok && response.data) {
          const { data } = response;
          const assignmentSession = await getAssignmentIdsInSession(startDate);
          const processedData = processAssignments(data, assignmentSession, clientIdsParam);

          setAssignmentList(processedData);

          const { calculatedPoints, calculatedMaps } = calculatePointsAndMaps(processedData);

          setAssignmentLocationMap(calculatedMaps);
          setPoints(calculatedPoints);

          if (shipmentSelected && shipmentSelected.lat && shipmentSelected.lng) {
            fitBoundary([
              [shipmentSelected.lng - 0.007, shipmentSelected.lat - 0.007],
              [shipmentSelected.lng + 0.007, shipmentSelected.lat + 0.007],
            ]);
          } else {
            const latlngs = processedData.filter(a => a.path).flatMap(a => a.path);
            const lats = latlngs.map(l => l[0]);
            const lngs = latlngs.map(l => l[1]);
            let boundary = null;
            if (latlngs.length < 2) {
              boundary = null;
            } else {
              boundary = [
                [_.min(lngs), _.min(lats)],
                [_.max(lngs), _.max(lats)],
              ];

              if (boundary[1][0] < boundary[0][0] + 0.001) {
                boundary[1][0] = boundary[0][0] + 0.001;
              }
              if (boundary[1][1] < boundary[0][1] + 0.001) {
                boundary[1][1] = boundary[0][1] + 0.001;
              }
            }
            fitBoundary(boundary);
          }
          setMapLoading(false);
          if(isMobile && processedData) {
            alert("loaded ", +processedData.length )
          }
        } else {
          setAssignmentLocationMap([]);
          setPoints([]);
          setMapLoading(false);
          setLayers([]);
        }
      })
      .catch((error) => {
        console.log(error);
        setMapLoading(false);
      });
  };

  const loadShipment = (date) => {
    if (isLoading) {
      return;
    }

    if (points.length === 0) {
      setShipmentData([]);
      setOpenShipmentPopup(false);
    }

    if (shipmentInput && shipmentInput.length > 0 && points.length > 0) {
      const ids = shipmentInput.split(/[^\da-zA-Z]+/).filter(Boolean);

      const startDate = moment(date).format('YYYY-MM-DD');

      setIsLoading(true);
      api.post(`/redelivery/redelivery/shipments?date=${startDate}`, { ids })
        .then(resp => {
          if (resp.ok && resp.data) {
            let data = resp.data.map(s => ({
              id: s.id,
              assignmentId: s.assignment_id,
              status: s.status,
              lat: s.dropoff_address.lat,
              lng: s.dropoff_address.lng,
              regionCode:s.region_code,
              clientId: s.client_id
            }));
            let clientShipmentFilter = clientIdsParam;
            if (clientShipmentFilter != null && clientShipmentFilter.length > 0) {
              if (bypassClientIds != null && bypassClientIds.length > 0) {
                clientShipmentFilter = clientShipmentFilter.concat(bypassClientIds)
              }
              data = data.filter(s => clientShipmentFilter.includes(s.clientId))
            }
            const boxCount = Number(searchParams.get('plus_bc'));
            const plusBoxCount = Number.isNaN(boxCount) ? 0 : boxCount;
            const maxDistance = Number(searchParams.get('max_distance'));
            const maxDistanceCount = Number.isNaN(maxDistance) || maxDistance === 0 ? null : maxDistance;
            const payload = {
              limit: 3000,
              sort_by: '-id',
              shipment_ids: data && data.map(item => item.id),
              date: moment(date).format('YYYY-MM-DD'),
              clients: clientIdsParam.length > 0 ? clientIdsParam : clientList.commingle,
              region_codes: regions.map((region) => region.value),
              plus_bc: plusBoxCount,
              max_distance: maxDistanceCount,
            }
              
            searchNearestAssignment(payload).then(res => {
              setIsLoading(false);
              if(res.ok) {
                const convertData = data && data.map(item => {
                  const findShipment = res.data && res.data.find(s => s.id === item.id) || {};
                  return {
                    ...item,
                    ...findShipment,
                    distance: findShipment.distance && findShipment.distance.toFixed(4),
                  }
                });
                data = _.sortBy(convertData || [], ["message", "status"]);
                setShipmentData(data);
                setOpenShipmentPopup(true);
              }
              else {
                data = [];
                setShipmentData([]);
                setOpenShipmentPopup(false);
                toast.error(res && res.data && res.data.message || 'Something went wrong', {containerId: 'main'});
              }
            })
          }
        })
        .catch((error) => {
          setIsLoading(false);
          setShipmentData([]);
          setOpenShipmentPopup(false);
          toast.error(error, {containerId: 'main'});
        });
    }
  };

  const addShipmentList = () => {
    setAdding(true);
    let submitData = _.groupBy(shipmentData.filter(s => s.target_assignment_id && !s.no_nearest), 'target_assignment_id');

    submitData = _.mapValues(submitData, function(v) {
      return v.map(s => s.id);
    });

    redeliveryMultipleV2(submitData, true).then(resp => {
      setAdding(false);
      if (resp.ok) {
        const mapResponse = _.groupBy(resp.data, 'shipment_id');
        setShipmentData(produce(shipmentData, (draft) => {
          draft.forEach(s => {
            if (mapResponse[s.id] && mapResponse[s.id].length > 0 && mapResponse[s.id][0].ok) {
              s.added = true;
              if (mapResponse[s.id][0].assignment_id) {
                s.assignment_id = mapResponse[s.id][0].assignment_id;
              }
            } else {
              s.added = false;
              if (mapResponse[s.id] && mapResponse[s.id].length > 0 && mapResponse[s.id][0].message) {
                s.message = mapResponse[s.id][0].message;
              }
            }
          })
        }))
      }
    });
  }

  const handleTextChange = data => {
    setShipmentInput(data);
  };

  useEffect(() => {
    if(/iPhone/i.test(navigator.userAgent)){
      setIsMobile(true)
    }
    if(searchParams.get('max') != null) {
      setMaxDistance(searchParams.get('max'))
    }
    const fetchData = async () => {
      const activeClientsAPI = api.get('clients/active');
      const regionListAPI = api.get('regions');

      const [activeClients, regionList] = await Promise.all([activeClientsAPI, regionListAPI]);

      const clients = {};

      if(!activeClients.data || !regionList.data) return;
      for (let i = 0; i < activeClients.data.length; i++) {
        const client = activeClients.data[i];
        clients[client.client_id] = client.name;
      }

      setClientMap(clients);
      setClientOptions(activeClients.data.map((c) => ({ label: c.name, value: c.client_id })));
      setRegionList(regionList.data.map(({ properties }) => ({
          label: `[${properties.code}] ${properties.display_name}`,
          value: properties.code
        })
      ));

      const activeClientList = {};
      for (let i = 0; i < activeClients.data.length; i++) {
        const client = activeClients.data[i];
        const type = client && client.service_type && client.service_type.toLowerCase();

        if (!activeClientList[type]) activeClientList[type] = [];
        activeClientList[type].push(client.client_id);
      }
      activeClientList['specialty'] = activeClientList['specialty'] || activeClientList['special']; // ensure working on both staging and prods
      setClientList(activeClientList);
    }

    fetchData();
  }, []);

  return (
    <div>
      <div className={classes.inputWrapper}>
        <AxlDateInput
          arrow
          clear="true"
          style={{display:'flex', alignItems:'center'}}
          onChange={d => setDate(d)}
          options={{
            defaultValue: dateSelect,
            defaultDate: 'today',
            dateFormat: 'MMM DD, Y',
            placeHolder: 'today',
            enableTime: false,
            altInput: true,
            clickOpens: false,
            disableMobile: true
          }}
        />
        <AxlMultiSelect
          defaulValue={regionList.filter(option => regions.indexOf(option.value) >= 0)}
          placeholderButtonLabel="Select Regions"
          showValues={false}
          allowAll={true}
          onChange={(v) => setRegions(v)}
          placeholder="Search Regions..."
          options={regionList}
          style={{minWidth: '205px'}}
        />
         <AxlMultiSelect
            defaulValue={clientOptions[0]}
            placeholderButtonLabel="COMMINGLE"
            placeholder="Search Clients..."
            allowAll={true}
            options={clientOptions}
            onChange={(v) => setClientIds(v)}
            singular={true}
          />
          <TextareaAutosize
            placeholder="Exclude Assignment"
            label="Exclude Assignment"
            minRows={2}
            maxRows={5}
            variant="outlined"
            className={classes.assignmentIdExclude}
            id="standard-start-adornment"
            ref={exAssignmentRef}
          />
        <AxlButton
          compact
          style={{ minWidth: 120 }}
          onClick={() => loadAssignments(dateSelect)}
        >{`LOAD ROUTES`}</AxlButton>
      </div>

      <div className={classes.inputWrapper}>
        <TextareaAutosize
            label="Shipment Ids"
            minRows={2}
            maxRows={5}
            variant="outlined"
            className={classes.shipmentIds}
            id="standard-start-adornment"
            value={shipmentInput}
            onChange={e => handleTextChange(e.target.value)}
        />
        <AxlButton
          compact
          style={{ minWidth: 120, marginLeft: 20 }}
          onClick={() => loadShipment(dateSelect)}
          loading={isLoading}
        >{`LOAD SHIPMENT`}</AxlButton>
      </div>
      <div className={classes.inputWrapper}>
        <ToggleButton
          className={classes.toggle}
          color="primary"
          size="small"
          value="check"
          selected={openShipmentPopup}
          onChange={() => {
            setOpenShipmentPopup(!openShipmentPopup);
          }}
        >
          <ListAltIcon />
        </ToggleButton>
      </div>
      <div className={classes.mapWrapper}>
        <ShipmentList
          shipments={shipmentData}
          isOpen={openShipmentPopup}
          setOpen={setOpenShipmentPopup}
          shipmentSelected={shipmentSelected}
          handleClickShipment={handleClickShipment}
          onAddShipments={addShipmentList}
          adding={adding}
        />
        {!isMobile &&<ReactMapGL
          {...viewport}
          mapStyle={mapStyle}
          initialViewState={INITIAL_VIEW_STATE}
          onViewportChange={v => setViewport(v)}
          width="100%"
          height="700px"
          style={{ border: '1px solid #ccc' }}
        >
          <DeckGL viewState={viewport} layers={layers} />
          {shipmentData &&
            shipmentData
              .filter(s => s && s.lat && s.lng)
              .map(s => {
                return (
                  <Marker key={s.id} latitude={s.lat} longitude={s.lng} offsetLeft={-11} offsetTop={-11}>
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '11px',
                        backgroundColor: shipmentSelected.id === s.id ? '#ff60e2' : '#636363',
                        opacity: 0.8,
                        fontWeight: 'bold',
                      }}
                    >
                      {s.id}
                    </div>
                  </Marker>
                );
              })}
          {assignmentPopup && (
            <Popup
              tipSize={5}
              anchor="bottom"
              longitude={assignmentPopup.location[0]}
              latitude={assignmentPopup.location[1]}
              offsetTop={-18}
              captureClick={true}
              className={'map-tooltip'}
              closeButton={true}
              closeOnClick={false}
              onClose={() => setAssignmentPopup(false)}
            >
              <AssignmentDetailPopup
                assignment={assignmentPopup.assignment}
                shipment={shipmentSelected}
                addShipments={addShipments}
                clientList={clientList}
                bypassClientIds={bypassClientIds}
              />
            </Popup>
          )}
          </ReactMapGL>
        }

        {isMapLoading && (
          <Box className={classes.loadingBG} display="flex" alignItems={'center'} justifyContent={'center'}>
            <CircularProgress size={75} thickness={4} />
          </Box>
        )}
      </div>
    </div>
  );
};

export default AddRedeliveryV2;
