import React, {useEffect, useState, Fragment} from "react";
import {useParams} from "react-router-dom";
import {
  Box, Grid, Button, Select, MenuItem, TextField, IconButton, LinearProgress, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, RadioGroup, Radio, FormControlLabel, Tooltip, Checkbox
} from "@material-ui/core";
import {
  Close as CloseIcon, Error as ErrorIcon, ErrorOutline as WarningIcon, FileCopyOutlined as CopyIcon
} from "@material-ui/icons";
import ReactMapGL, {LinearInterpolator, Marker, Popup} from "react-map-gl";
import DeckGL, {IconLayer, PathLayer} from "deck.gl";
import WebMercatorViewport from 'viewport-mercator-project';
import clsx from "clsx";
import _ from "lodash";
import moment from "moment-timezone";

import useStyles from "./styles";
import FrankenrouteShipment from "../../components/FrankenrouteShipment";
import * as store from "../../stores/api";
import DOTS from '../../containers/AssignmentListMap/data/dots.svg';
import MARKERS from '../../containers/AssignmentListMap/data/markers.svg';
import ListFrankenRoute from "./list";
import {UNROUTEABLE_STATUSES} from "../../constants/shipment";
import SimpleModal from "../../components/SimpleModal";
import { convertMeterToMile } from "../../constants/common";

function Frankenroute(props) {
  const classes = useStyles();
  const {id} = useParams();

  const [problem, setProblem] = useState({});
  const [subProblems, setSubProblems] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [solution, setSolution] = useState({});
  const [routeInfo, setRouteInfo] = useState({});
  const [bonusConfig, setBonusConfig] = useState({});
  const [bonus, setBonus] = useState(0);
  const [shipments, setShipments] = useState([]);
  const [clients, setClients] = useState([]);
  const [items, setItems] = useState([]);
  const [regions, setRegions] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedID, setSelectedID] = useState(0);
  const [selectedWh, setSelectedWh] = useState({});
  const [showAddShipments, setShowAddShipments] = useState(false);
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showIDs, setShowIDs] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [routing, setRouting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keepLabel, setKeepLabel] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  const [shipmentPopup, setShipmentPopup] = useState(false);
  const [browsing, setBrowsing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [overBonus, setOverBonus] = useState(false);
  const [type, setType] = useState("id");
  const [window, setWindow] = useState("reset");
  const [minWindow, setMinWindow] = useState(0);
  const [maxWindow, setMaxWindow] = useState(0);
  const [minShipmentWindow, setMinShipmentWindow] = useState(0);
  const [maxShipmentWindow, setMaxShipmentWindow] = useState(0);
  const [inputList, setInputList] = useState("");
  const [prefix, setPrefix] = useState("");
  const [label, setLabel] = useState("");
  const [step, setStep] = useState("");
  const [error, setError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [viewport, setViewport] = useState({
    latitude: 37.7577,
    longitude: -122.4376,
    zoom: 11
  });

  const unrouteableShipments = shipments.filter(sh => sh.unrouteable);
  const mapStyle = process.env.REACT_APP_MAP_STYLE_URL;
  const shipmentSourceTypes = [
    {value: 'id', label: 'By Shipment IDs'},
    {value: 'tracking_code', label: 'By Tracking Codes'},
    {value: 'client_internal_shipment_id', label: 'By Internal IDs'},
    {value: 'assignment_id', label: 'By Assignment IDs'},
  ];
  const iconW = 36, iconH = 36, iconAnchor = 18;
  const iconMapping = {
    red: {x: iconW, y: 0, width: iconW, height: iconH, anchorY: iconAnchor},
    yellow: {x: iconW * 2, y: 0, width: iconW, height: iconH, anchorY: iconAnchor},
    purple: {x: iconW * 4, y: 0, width: iconW, height: iconH, anchorY: iconAnchor},
    white: {x: iconW * 5, y: 0, width: iconW, height: iconH, anchorY: iconAnchor},
    green: {x: 0, y: 0, width: 80, height: 110, anchorY: 110},
    blank: {x: 0, y: 0, width: iconW, height: iconH, anchorY: iconAnchor, mask: true},
  };

  let timezone = 'America/Los_Angeles';
  if (shipments.length) {
    const sh = shipments.filter(sh => !!sh.timezone).pop();
    if (sh) timezone = sh.timezone;
  }
  if (selectedWh.timezone) {
    timezone = selectedWh.timezone;
  }

  useEffect(() => {
    store.getClientList(500, 0).then(res => {
      if (res.ok) {
        setClients(res.data);
      } else {
        setClients([]);
      }
    });

    store.getBonusConfig().then(res => {
      if (res.ok) {
        setBonusConfig(res.data);
      } else {
        setBonusConfig({});
      }
    })

    if (!!id) {
      // load problem
      setLoading(true);
      store.getProblem(id).then(res => {
        if (res.ok) {
          const {problem} = res.data;
          setProblem(problem);
          setItems(problem.shipment_ids);
          addShipments(problem.shipment_ids);
          store.getProblemConfig(id).then(res => {
            if (res.ok) {
              const {prefix, start_label} = res.data;
              setPrefix(prefix);
              setLabel(start_label);
            }
          });
          store.getSubProblems(id).then(res => {
            if (res.ok && res.data && res.data.length) {
              setSubProblems(res.data);
              const subProblem = res.data[0];
              const solutionId = subProblem.selected_solution;
              if (solutionId) {
                store.getSelectedSolution(problem.id).then(res => {
                  if (res.ok) {
                    const {solution_id} = res.data;
                    store.getSelectedSolutionRoutes(solution_id).then(res => {
                      if (res.ok) {
                        const {assignments} = res.data;
                        setAssignments(assignments);
                      }
                      setLoading(false);
                    })
                  } else {
                    calculateRoutePricing(subProblem.id);
                  }
                })
                store.getSolution(solutionId).then(res => {
                  if (res.ok) {
                    setSolution(res.data)
                  }
                  setLoading(false);
                });
              } else {
                setLoading(false);
              }
            } else {
              setLoading(false);
            }
          })
        } else {
          setLoading(false);
        }
      })
    }
  }, [])

  useEffect(() => {
    if (!!problem.dropoff_earliest_ts) {
      if (minWindow * 1000 === moment(problem.dropoff_earliest_ts).valueOf()) {
        setWindow("shipment");
      }
    }
  }, [loading])

  useEffect(() => {
    let list = [];
    if (['id', 'assignment_id'].includes(type)) {
      const arr = inputList.split(/[^\d]+/);
      list = arr.map(id => id.trim()).filter(id => id !== "").map(id => parseInt(id));
    } else if (['tracking_code', 'client_internal_shipment_id'].includes(type)) {
      const arr = inputList.split(/\s+|,/);
      list = arr.map(d => d.trim()).filter(d => d !== "");
    }

    setItems(list);
  }, [type, inputList])

  useEffect(() => {
    const regionList = shipments.map(sh => sh.region_code).filter(rg => !!rg);
    if (regionList.length !== regions.length && !_.isEmpty(_.xor(regionList, regions))) {
      setRegions(Array.from(new Set(regionList)));
    }

    fitBoundary(calculateBoundary());
    getShipmentsTimeWindow();
  }, [shipments])

  useEffect(() => {
    if (regions.length) {
      setLoadingWarehouses(true);
      store.getWarehouses({regions, size: 100 * regions.length, types: ['Main', 'Mobile Hub']}).then(res => {
        if (res.ok && res.data) {
          const warehouseList = res.data.sort((a, b) => {
            if (!!a.alias && a.alias.indexOf("MAIN") > -1) {
              return -1;
            } else if (a.id > b.id) {
              return -1;
            }
            return 1;
          })
          setWarehouses(warehouseList);
          if (problem.warehouse_id) {
            const warehouse = _.filter(res.data, w => w.id === problem.warehouse_id).pop();
            setSelectedWh(warehouse || {})
          }
        }
        setLoadingWarehouses(false);
      });
    } else {
      setWarehouses([]);
    }
  }, [regions])

  useEffect(() => {
    fitBoundary(calculateBoundary());
  }, [selectedWh])

  useEffect(() => {
    if (window === 'shipment') {
      setMinWindow(moment(minShipmentWindow).tz(timezone).utc().valueOf() / 1000);
      setMaxWindow(moment(maxShipmentWindow).tz(timezone).utc().valueOf() / 1000);
    } else if (window === 'reset') {
      const minW = moment().tz(timezone).set({hour:8,minute:0,second:0,millisecond:0}).utc().valueOf();
      const maxW = moment().tz(timezone).set({hour:20,minute:0,second:0,millisecond:0}).utc().valueOf();

      setMinWindow(minW / 1000);
      setMaxWindow(maxW / 1000);
    }
  }, [window, minShipmentWindow, maxShipmentWindow])

  useEffect(() => {
    if (bonusConfig.tier) {
      const maxBoxBonus = bonusConfig.max_per_box * shipments.length;
      const maxBonus = bonusConfig.bonusType === 'MAX' ? Math.max(maxBoxBonus, bonusConfig.max_bonus) : Math.min(maxBoxBonus, bonusConfig.max_bonus);

      if (bonus > maxBonus) {
        setOverBonus(true);
      } else {
        setOverBonus(false);
      }
    }
  }, [bonus])

  useEffect(() => {
    console.log(step);
    const subProblem = subProblems[0];
    setProblem({...problem, status: step});
    switch (step) {
      case "CREATING_PROBLEM":
        const problemParams = {
          number_of_iterations: 5000 + (shipments.length * 200),
          number_of_threads: 20,
          vehicles: [],
          warehouse_id: selectedWh.id,
          shipment_ids: shipments.map(sh => sh.id),
        }
        store.createProblem(problemParams).then(res => {
          if (res.ok) {
            const prob = res.data;
            store.updateProblemStatus(res.data.id, "CREATED").then(res => {
              if (window === 'reset') {
                setProblem({...prob, dropoff_earliest_ts: null, dropoff_latest_ts: null});
                setStep("UPDATING_TIME_WINDOW");
              } else {
                setProblem(prob);
                setStep("CLUSTERING");
              }
            })
          } else {
            setRouting(false);
          }
        })
        break;
      case "UPDATING_TIME_WINDOW":
        if (!problem.id) {
          setRouting(false);
          break;
        }

        store.updateTimeWindow(problem.id, minWindow, maxWindow).then(res => {
          if (res.ok) {
            setProblem({...problem, dropoff_earliest_ts: minWindow * 1000, dropoff_latest_ts: maxWindow * 1000})
            setStep("CLUSTERING");
          } else {
            setRouting(false);
          }
        })
        break;
      case "CLUSTERING":
        if (!problem.id) {
          setRouting(false);
          break;
        }

        const shipmentZones = {};
        shipments.forEach(sh => shipmentZones[sh.id] = 1);
        store.clusterZone(problem.id, shipmentZones).then(res => {
          if (res.ok) {
            store.updateProblemStatus(problem.id, "LABELING").then(res => {
              setStep("LABELING");
            })
          } else {
            setRouting(false);
          }
        })

        break;
      case "LABELING":
        if (!problem.id) {
          setRouting(false);
          break;
        }

        store.configLabel(problem.id, {prefix, start_label: label, group_by_region: true}).then(res => {
          if (res.ok) {
            store.updateProblemStatus(problem.id, "OPTIMIZING_ZONE").then(res => {
              setStep("OPTIMIZING_ZONE");
            })
          } else {
            setRouting(false);
          }
        })
        break;
      case "OPTIMIZING_ZONE":
        if (!problem.id) {
          setRouting(false);
          break;
        }

        store.splitZones(problem.id).then(res => {
          if (res.ok) {
            setSubProblems(res.data);
            store.updateProblemStatus(problem.id, "LOADING_VEHICLE").then(res => {
              setStep("LOADING_VEHICLE");
            })
          } else {
            setRouting(false);
          }
        })
        break;
      case "LOADING_VEHICLE":
        if (!subProblem || !subProblem.id) {
          setRouting(false);
          break;
        }

        const workload = shipments.map(sh => sh.workload).reduce((a, b) => a + b, 0);
        store.addVehicle(subProblem.id, workload * 1.5, 1).then(res => {
          if (res.ok) {
            store.updateProblemStatus(problem.id, "START_ROUTING").then(res => {
              setStep("START_ROUTING");
            })
          } else {
            setRouting(false);
          }
        })
        break;
      case "START_ROUTING":
        if (!subProblem || !subProblem.id) {
          setRouting(false);
          break;
        }

        store.startRouting(subProblem.id).then(res => {
          if (res.ok) {
            store.updateProblemStatus(problem.id, "ROUTING_IN_PROGRESS").then(res => {
              setStep("ROUTING_IN_PROGRESS");
            })
          } else {
            setRouting(false);
          }
        })
        break;
      case "ROUTING_IN_PROGRESS":
        if (!subProblem.id) {
          setRouting(false);
          break;
        }

        refreshingRoute(problem.id, subProblem.id);
        break;
      case "COMPLETED":
        calculateRoutePricing(subProblem.id);
      case "ROUTING_ERROR":
        setRouting(false);
        break;
      default:
        setRouting(false);
        break;
    }
  }, [step])

  const refreshingRoute = (problemID, subID) => {
    if (!subID) return false;
    store.getProblem(subID).then(res => {
      if (res.ok) {
        const {problem} = res.data;
        if (problem.status != null && (problem.status.indexOf("ERROR") > -1 || problem.status.indexOf("FAILED") > -1)) {
          store.updateProblemStatus(problemID, "ROUTING_ERROR").then(res => {
            setStep("ROUTING_ERROR");
          });
          return false;
        }

        if (["ROUTING_DONE", "ROUTING_COMPLETE"].includes(problem.status)) {
          if (!!problem.selected_solution) {
            store.getSolution(problem.selected_solution).then(res => {
              setSolution(res.data);
              store.updateProblemStatus(problemID, "COMPLETED").then(res => {
                setStep("COMPLETED");
              })
            })
          }
          return false;
        } else {
          setTimeout(() => {
            refreshingRoute(problemID, subID);
          }, 3000);
        }
      } else {
        setRouting(false);
      }
    })
  }

  const onShowConfirmRemove = (id) => {
    setShowConfirmRemove(true);
    setSelectedID(id);
  }

  const removeShipment = (id) => {
    const shipmentList = shipments.filter(sh => sh.id !== id);
    setShipments(shipmentList);
    setShowConfirmRemove(false);
    setShipmentPopup(false);
  }

  const closeAddShipments = () => {
    setShowAddShipments(false);
    changeParams({target: {value: ""}});
    setError("");
    setPulling(false);
  }

  const closeShowError = () => {
    setShowError(false);
    setError("");
  }

  const closeShowConfirm = () => {
    setShowConfirm(false);
  }

  const changeType = (e) => {
    setType(e.target.value);
  }

  const changeParams = (e) => {
    const {value} = e.target;
    setInputList(value);
  }

  const addShipments = (ids) => {
    if (["id", "assignment_id"].includes(type) && inputList.match(/[a-zA-Z]/g)) {
      alert("Only numbers allow for ID, pls remove letters from input list!");
      return;
    }

    setPulling(true);
    setError("");
    const itemSet = ids ? ids : new Set(items);

    store.listShipmentsByField(type, Array.from(itemSet)).then(res => {
      if (res.ok) {
        const existsIDs = shipments.map(sh => sh.id);
        const newList = res.data.filter(sh => !existsIDs.includes(sh.id)).map(sh => {
          sh.unrouteable = UNROUTEABLE_STATUSES.includes(sh.status);
          return sh;
        });
        setShipments([...shipments, ...newList]);
        closeAddShipments();
      } else {
        setError(res.data ? res.data.message : "Error while pulling");
      }
      setPulling(false);
    })
  }

  const selectWarehouse = (e) => {
    const whID = e.target.value;
    if (!whID) {
      setSelectedWh({})
    }
    const wh = _.filter(warehouses, w => w.id === whID).pop();
    setSelectedWh(wh || {});
  }

  const getShipmentsTimeWindow = () => {
    if (!shipments.length)
      return;
    const minWindows = shipments.map(sh => moment(sh.dropoff_earliest_ts).valueOf());
    const maxWindows = shipments.map(sh => moment(sh.dropoff_latest_ts).valueOf());
    const minWindow = Math.min(...minWindows);
    const maxWindow = Math.max(...maxWindows);

    setMinShipmentWindow(minWindow);
    setMaxShipmentWindow(maxWindow);
  }

  const changeTimeWindow = (e) => {
    setWindow(e.target.value);
  }

  const calculateRoutePricing = (subID) => {
    setCalculatingPrice(true);
    const deliveryDate = problem.dropoff_earliest_ts ? moment(problem.dropoff_earliest_ts).valueOf() : null;
    store.getRoutePricingInfo(subID, deliveryDate).then(res => {
      if (res.ok && res.data && res.data.length) {
        setRouteInfo(res.data[0]);
      } else {
        setRouteInfo({});
      }
      setCalculatingPrice(false);
    })
  }

  const runRouting = () => {
    if (!shipments.length) {
      setError("No shipments to run!")
      setShowError(true);
      return;
    }

    if (unrouteableShipments.length) {
      setError("Please remove error shipment to run routing!")
      setShowError(true);
      return;
    }

    if (!label) {
      setError("Label are required!");
      setShowError(true);
      return;
    }

    const lats = new Set(shipments.map(sh => !sh.pickup_address ? 0 : sh.pickup_address.lat.toFixed(6)));
    if (lats.size > 1 && !selectedWh.id) {
      setError("Shipments have multi pickup location, pls select one before routing");
      setShowError(true);
      return;
    }

    setRouting(true);
    if (!problem.id) {
      setStep("CREATING_PROBLEM");
    } else {
      if (problem && problem.status) {
        if (['ROUTING_ERROR', 'COMPLETED'].includes(problem.status)) {
          setStep("START_ROUTING")
        } else if (problem.status === 'CREATED') {
          if (window === 'reset') {
            setStep("UPDATING_TIME_WINDOW");
          } else {
            setStep("CLUSTERING");
          }
        } else {
          setStep(problem.status);
        }
      } else {
        setStep("");
      }
    }
  }

  const confirmRoute = () => {
    if (!problem.id) return;

    setConfirming(true);
    setConfirmError("");
    store.selectProblemSolution(problem.id, keepLabel).then(res => {
      if (res.ok) {
        const {solution_id} = res.data;
        store.updateProblemStatus(problem.id, "CONFIRMED").then(() => {
          store.getSelectedSolutionRoutes(solution_id).then(res => {
            if (res.ok && res.data) {
              const {assignments} = res.data;
              setAssignments(assignments);
              // add bonus to assignment
              if (bonus > 0 && assignments.length) {
                const assignment = assignments[0];
                if (assignment && assignment.id) {
                  store.updateBonus(assignment.id, bonus).then(res => {
                    if (!res.ok) {
                      setConfirmError(res.data.message);
                    }
                    setConfirming(false);
                  });
                }
              } else {
                setConfirming(false);
              }
            } else {
              setConfirmError("Error while confirming route, code " + res.status)
              setConfirming(false);
            }
          })
        })
      } else {
        setConfirmError("Error while confirming route, code " + res.status)
        setConfirming(false);
      }
    });
  }

  const calculateBoundary = () => {
    const lats = shipments.filter(sh => sh.dropoff_address && sh.dropoff_address.lat && sh.dropoff_address.lng).map(sh => sh.dropoff_address.lat);
    const lngs = shipments.filter(sh => sh.dropoff_address && sh.dropoff_address.lat && sh.dropoff_address.lng).map(sh => sh.dropoff_address.lng);

    if (selectedWh && selectedWh.address && selectedWh.address.lat) {
      lats.push(selectedWh.address.lat);
    }

    if (selectedWh && selectedWh.address && selectedWh.address.lng) {
      lngs.push(selectedWh.address.lng);
    }

    if (!lats.length || !lngs.length)
      return null;

    const boundary = [
      [_.min(lngs), _.min(lats)],
      [_.max(lngs), _.max(lats)],
    ];

    if (boundary[1][0] < boundary[0][0] + 0.001) {
      boundary[1][0] = boundary[0][0] + 0.001;
    }
    if (boundary[1][1] < boundary[0][1] + 0.001) {
      boundary[1][1] = boundary[0][1] + 0.001;
    }

    return boundary;
  }

  const fitBoundary = boundary => {
    if (!boundary) return;
    const isTooSmall = boundary[1][0] - boundary[0][0] < 0.0004;
    const c = { longitude: boundary[0][1], latitude: boundary[0][0], zoom: 2 };
    const viewportWeb = new WebMercatorViewport(viewport);
    boundary = boundary.slice().map(b => b.slice());
    const renderViewport = viewportWeb.fitBounds(boundary, { padding: 20, offset: [0, -100] });
    const { longitude, latitude, zoom } = isTooSmall ? c : renderViewport;
    setViewport({ ...viewport, longitude, latitude, zoom, transitionDuration: 500 });
  };

  const renderMarkers = () => {
    const dropoffMarkers = shipments.filter(sh => sh.dropoff_address && sh.dropoff_address.lat && sh.dropoff_address.lng)
      .map(sh => {
        return {
          location: [sh.dropoff_address.lng, sh.dropoff_address.lat],
          shipment: sh,
          size: 18,
          icon: sh.unrouteable ? 'red' : 'purple',
        }
      });

    return new IconLayer({
      id: 'dropoff-markers',
      data: dropoffMarkers,
      pickable: true,
      iconAtlas: DOTS,
      iconMapping: iconMapping,
      getIcon: d => d.icon,
      sizeScale: 1,
      opacity: 1,
      visible: true,
      getPosition: d => d.location,
      getSize: d => d.size,
      onClick: (info) => {
        const {object} = info;
        if (object && object.shipment) {
          setShipmentPopup(object);
        } else {
          setShipmentPopup(false);
        }
      }
    });
  }

  const renderPickup = () => {
    const lats = new Set(shipments.map(sh => !sh.pickup_address ? 0 : sh.pickup_address.lat.toFixed(6)));
    if (lats.size > 1 && !selectedWh.id)
      return null;

    let pickupLocation = [];
    if (!!selectedWh.id) {
      pickupLocation = [selectedWh.address.lng, selectedWh.address.lat];
    } else {
      const sh = shipments.filter(sh => !!sh.pickup_address && !!sh.pickup_address.lat && !!sh.pickup_address.lng);
      if (sh.length > 0) {
        pickupLocation = [sh[0].pickup_address.lng, sh[0].pickup_address.lat];
      }
    }

    if (!pickupLocation.length) {
      return null;
    }

    const data = [{
      location: pickupLocation,
      size: 50,
      icon: 'green',
    }];

    return new IconLayer({
      id: 'pickup-markers',
      data: data,
      pickable: true,
      iconAtlas: MARKERS,
      iconMapping: iconMapping,
      getIcon: d => d.icon,
      sizeScale: 1,
      opacity: 1,
      visible: true,
      getPosition: d => d.location,
      getSize: d => d.size,
      onClick: (info) => null
    });
  }

  const renderRoute = () => {
    if (!solution || !solution.routes) {
      return;
    }

    const startStops = [];
    const data = solution.routes.filter(route => !!route.stops && route.stops.length)
      .map((route, i) => {
        if (i === 0) {
          startStops.push({
            location: _.reverse(route.stops[0].location.latlng.slice()),
            size: 30,
            icon: 'blank',
            color: [15, 48, 217]
          })
        }

        return {
          path: route.stops.filter(st => st.location && st.location.latlng).map(st => [st.location.latlng[1], st.location.latlng[0]]),
          color: [230,145,56],
          id: route.id
        }
      });

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

    const startLayer = new IconLayer({
      id: 'start-stop-layer',
      data: startStops,
      pickable: true,
      iconAtlas: DOTS,
      iconMapping: iconMapping,
      getIcon: d => d.icon,
      sizeScale: 1,
      opacity: 1,
      visible: true,
      billboard: false,
      getPosition: d => d.location,
      getSize: d => d.size,
      getColor: d => d.color
    });

    return [pathLayer, startLayer];
  }

  return (
    <Box className={classes.container} p={2}>
      {loading && (
        <Box className={classes.loadingOverlay}>
          <Box className={classes.loading}><CircularProgress color="primary" size={100} /></Box>
        </Box>
      )}
      <Box className={classes.header} component="h2" py={1} mb={1} mt={0} align="left">
        <span>Create Frankenroute</span>
        <Button onClick={() => setBrowsing(true)} variant="outlined" size="small" className={classes.browseButton}>
          History
        </Button>
      </Box>
      <Grid container justifyContent="space-between" spacing={2} className={classes.gridWrapper}>
        <Grid item sm={4}>
          <Box className={classes.wrapper}>
            <Grid container direction="column" className={classes.inner}>
              <Grid item>
                <Box p={2} pb={1}>
                  <Grid container justifyContent="space-between" className={classes.header}>
                    <Grid item>
                      <Box component="span">1. Shipment List</Box>
                      <Tooltip title="Copy shipment IDs">
                        <CopyIcon color="inherit" className={classes.copyIcon} onClick={() => setShowIDs(true)} />
                      </Tooltip>
                    </Grid>
                    <Grid item>
                      Total shipments: {shipments.length}
                      (<span className={classes.error}>
                        {unrouteableShipments.length}
                        <Tooltip title="Number of unrouteable shipments, please remove them before run routing">
                          <WarningIcon style={{fontSize: 18, verticalAlign: 'sub'}} />
                        </Tooltip>
                      </span>)
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
              <Grid item className={classes.shipmentListWrapper}>
                <Box p={1} m={2} mt={0} className={classes.shipmentList}>
                  <Box p={1} className={classes.shipmentListInner}>
                    {!shipments.length && <Box className={classes.noItems}>NO CURRENT SHIPMENTS AVAILABLE</Box>}
                    {!!shipments.length && shipments.map(sh => (
                      <FrankenrouteShipment shipment={sh} clients={clients} problem={problem} onShowConfirmRemove={onShowConfirmRemove} key={sh.id} />
                    ))}
                  </Box>
                </Box>
              </Grid>
              <Grid item>
                <Box px={3} py={1}>
                  <Button variant="contained"
                          size="small"
                          disableElevation
                          disabled={routing || problem.id}
                          className={classes.greyButton}
                          onClick={() => setShowAddShipments(true)}
                  >
                    Add Shipments
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>
        <Grid item sm={4}>
          <Box className={classes.wrapper} p={2}>
            <Grid container direction="column" className={classes.inner}>
              <Grid item style={{width: '100%'}}>
                <Box pb={1}>
                  <Box className={classes.header}>2. Route Settings</Box>
                </Box>
                <Box pb={1}>
                  <Box className={classes.title}>Pickup Location</Box>
                  <Box>
                    <Select fullWidth variant="outlined"
                            displayEmpty margin="dense"
                            className={classes.selectBox}
                            value={selectedWh.id || ""}
                            disabled={loadingWarehouses || routing || problem.warehouse_id}
                            onChange={selectWarehouse}
                    >
                      <MenuItem value=""><span className={classes.placeholder}>Select warehouse/pickup address</span></MenuItem>
                      {warehouses.map(wh => (
                        <MenuItem value={wh.id} key={wh.id}>
                          <span className={classes.selectItem}>
                            {wh.alias} [{wh.id}] @ {wh.address && `${wh.address.street}, ${wh.address.city} ${wh.address.state} ${wh.address.zipcode}`}
                          </span>
                        </MenuItem>
                      ))}
                    </Select>
                    <Box style={{minHeight: 5}}>
                      {loadingWarehouses && <LinearProgress color="primary" />}
                    </Box>
                  </Box>
                </Box>
                <Box pb={1}>
                  <Box className={classes.title}>
                    Assignment Label
                    <Box component="small" pl={1}>(No Q, I and digit available in label)</Box>
                  </Box>
                  <Grid container spacing={2} justifyContent="space-between">
                    <Grid item xs={4}>
                      <TextField
                        value={prefix}
                        onChange={e => {
                          const value = (e.target.value || "").toUpperCase().trim();
                          setPrefix(value.substr(0, 4));
                        }}
                        inputProps={{className: classes.selectBox}}
                        disabled={routing || problem.id}
                        placeholder="Prefix"
                        variant="outlined"
                        margin="none"
                        size="small"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={8}>
                      <TextField
                        value={label}
                        onChange={e => {
                          const value = (e.target.value || "").toUpperCase().trim().replace(/[QI0-9]/gi, '').substr(0, 2);
                          setLabel(value);
                        }}
                        inputProps={{className: classes.selectBox}}
                        disabled={routing || problem.id}
                        placeholder="Label"
                        variant="outlined"
                        margin="none"
                        size="small"
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Box>
                <Box pb={1}>
                  <Box className={classes.title}>
                    <Box component="span" mr={1}>Assignment time window</Box>
                    <Box component="small"><em>({timezone})</em></Box>
                  </Box>
                  {!problem.dropoff_earliest_ts && (
                    <Box>
                      <RadioGroup value={window} onChange={changeTimeWindow} row name="time_window" className={classes.radioGroup}>
                        <FormControlLabel
                          value="shipment"
                          control={<Radio color="primary" size="small" disabled={routing || problem.id} />}
                          label={<Box className={classes.radioLabel}>
                            <Box>Use shipment window</Box>
                            {!!minShipmentWindow && <Box>{moment(minShipmentWindow).tz(timezone).format('HH:mm MM/DD')} - {moment(maxShipmentWindow).tz(timezone).format('HH:mm MM/DD')}</Box>}
                          </Box>}
                        />
                        <FormControlLabel
                          value="reset"
                          control={<Radio color="primary" size="small" disabled={routing || problem.id} />}
                          label={<Box className={classes.radioLabel}>
                            <Box>Reset time window</Box>
                            <Box>8AM - 8PM {moment(problem.dropoff_earliest_ts).tz(timezone).format("MM/DD")}</Box>
                          </Box>}
                        />
                      </RadioGroup>
                    </Box>
                  )}
                  {!!problem.dropoff_earliest_ts && (
                    <Box align="center">
                      {moment(problem.dropoff_earliest_ts).tz(timezone).format("MM/DD HH:mm")} - {moment(problem.dropoff_latest_ts).tz(timezone).format("MM/DD HH:mm")}
                    </Box>
                  )}
                </Box>
                <Box py={2}>
                  <Button variant="contained"
                          size="small"
                          disableElevation
                          disabled={routing || assignments.length}
                          className={classes.greyButton}
                          onClick={runRouting}
                  >
                    Run Routing
                  </Button>
                  <Box component="span" px={2} style={{verticalAlign: "sub"}}>
                    {routing && <CircularProgress color="primary" size={20} />}
                    <Box component="span" px={1} style={{verticalAlign: "top"}}>{step || problem.status}</Box>
                  </Box>
                </Box>

                {regions.length > 1 && !problem.id && (
                  <Box pl={1} mb={2} mt={0} className={classes.warning}>
                    Beware! You are running shipments on multi-region [{regions.join(", ")}]. Please make sure you did it right.
                  </Box>
                )}

                {!problem.id && (
                  <Box pl={1} mb={2} mt={0} className={classes.warning}>
                    Please double check route settings and shipments list, you will NOT be able to change it after run routing.
                  </Box>
                )}
              </Grid>

              <Grid item>
                <Box pb={1}>
                  <Box className={classes.header}>3. Route Info</Box>
                </Box>
                {!!assignments.length && (
                  <Box p={2} className={classes.selectBox} align='center'>
                    <Box py={2}>Route has been confirmed.</Box>
                    {assignments.map(a => {
                      const date = moment(a.predicted_start_ts).format("YYYY-MM-DD");
                      return (
                        <Box key={a.id}>
                          <Box align="center" pb={1}>
                            <Box component="span">ID: <strong className={classes.header}>{a.id}</strong></Box>
                            <Box pl={2} component="span">Label: <strong className={classes.header}>{a.label}</strong></Box>
                          </Box>
                          <Box align="center">Delivery Date: <strong className={classes.header}>{date}</strong></Box>
                          <Box mt={2}>
                            <Button href={`/routes/${date}/${a.region_code}/all/${a.id}`} target="_blank"
                                    variant="contained" color="primary" size='small' disableElevation
                            >
                              View Route
                            </Button>
                          </Box>
                        </Box>
                      )
                    })}
                  </Box>
                )}
                {!assignments.length && (
                  <Box p={2} className={classes.selectBox}>
                    {calculatingPrice && (
                      <Box>
                        <Box align="center">Calculating route pricing...</Box>
                        <LinearProgress color="primary" />
                      </Box>
                    )}
                    {!calculatingPrice && routeInfo.stops && (
                      <Grid container>
                        <Grid item xs={6}>
                          <Box className={classes.title}>TOTAL SHIPMENTS</Box>
                          <Box className={classes.value}>{routeInfo.stops.length || 0}</Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box className={classes.title}>DELIVERY DATE</Box>
                          <Box className={classes.value}>{moment(problem.dropoff_earliest_ts).format("YYYY-MM-DD")}</Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box className={classes.title}>EST. DISTANCE</Box>
                          <Box className={classes.value}>{routeInfo.travel_distance ? `${convertMeterToMile(routeInfo.travel_distance, 2)} mi` : 'N/A'}</Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box className={classes.title}>EST. HOURS</Box>
                          <Box className={classes.value}>{routeInfo.travel_time ? `${(routeInfo.travel_time / 3600).toFixed(1)} hrs` : 'N/A'}</Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box className={classes.title}>PRICING</Box>
                          <Box className={classes.value}>{routeInfo.tour_cost ? `$${routeInfo.tour_cost}` : 'N/A'}</Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box className={classes.title}>BONUS</Box>
                          <Box className={classes.value}>
                            <TextField
                              className={classes.grayInput}
                              disabled={!bonusConfig.tier}
                              value={bonus}
                              onChange={e => setBonus(parseFloat(e.target.value))}
                              type="number"
                              placeholder="0.0"
                              variant="outlined"
                              margin="none"
                              size="small"
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    )}
                    {!calculatingPrice && !!solution.id && (
                      <Box py={0.5} className={classes.error}>
                        <Box component="small">
                          {bonusConfig.tier
                            ? `You can add bonus up to $${bonusConfig.max_bonus} or $${bonusConfig.max_per_box} per box (which is ${bonusConfig.bonus_type === 'MAX' ? 'higher' : 'lower'})`
                            : 'You do not have permission to add bonus'}
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}
                <Box py={2}>
                  <Button variant="contained"
                          size="small"
                          disableElevation
                          color="primary"
                          disabled={routing || calculatingPrice || !!assignments.length || !solution.id}
                          onClick={() => setShowConfirm(true)}
                  >
                    Confirm Route
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>
        <Grid item sm={4}>
          <Box className={classes.wrapper}>
            <ReactMapGL
              {...viewport}
              mapStyle={mapStyle}
              transitionInterpolator={new LinearInterpolator()}
              onViewportChange={(viewport) => setViewport(viewport)}
              width="100%"
              height="100%"
            >
              <DeckGL {...viewport} layers={[renderRoute(), renderPickup(), renderMarkers()]} />
              {shipmentPopup && (
                <Popup
                  tipSize={5}
                  anchor="bottom"
                  longitude={shipmentPopup.location[0]}
                  latitude={shipmentPopup.location[1]}
                  offsetTop={-18}
                  captureClick={true}
                  className={classes.popup}
                  closeButton={true}
                  closeOnClick={false}
                  onClose={() => setShipmentPopup(false)}
                >
                  <ul className={classes.popupList}>
                    <li>ID: <strong>{shipmentPopup.shipment.id}</strong></li>
                    <li>Tracking code: <strong>{shipmentPopup.shipment.tracking_code}</strong></li>
                    <li>Internal ID: <strong>{shipmentPopup.shipment.internal_id}</strong></li>
                    <li>Status: <strong>{shipmentPopup.shipment.status}</strong></li>
                    <li>Client ID: <strong>{shipmentPopup.shipment.client_id}</strong></li>
                    <li>Region: <strong>{shipmentPopup.shipment.region_code}</strong></li>
                  </ul>
                  <Box align="center">
                    <Button align="center" color="secondary" size="small"
                            variant="contained" disableElevation
                            className={classes.actionBtn}
                            disabled={routing || problem.id}
                            onClick={() => onShowConfirmRemove(shipmentPopup.shipment.id)}
                    >
                      Remove
                    </Button>
                  </Box>
                </Popup>
              )}
            </ReactMapGL>
          </Box>
        </Grid>
      </Grid>

      <SimpleModal open={showAddShipments} title="Add Shipments" onClose={closeAddShipments}>
        <DialogContent>
          <Box pb={2}>
            <Select value={type} onChange={changeType} variant="outlined" fullWidth className={classes.grayInput}>
              {shipmentSourceTypes.map(item => (
                <MenuItem value={item.value} key={item.value}>{item.label}</MenuItem>
              ))}
            </Select>
          </Box>
          <TextField
            rows={8}
            multiline
            variant="outlined"
            fullWidth
            className={classes.idInput}
            inputProps={{className: classes.idInput}}
            placeholder="Separate with comma or new line"
            value={inputList}
            onChange={changeParams}
          />
        </DialogContent>
        <DialogActions className={clsx(classes.dialogActions, classes.justifyBetween)}>
          <Box>
            {!!items.length && <em>{items.length} items</em>}
          </Box>
          <Box>
            <Button onClick={closeAddShipments} variant="contained" color="inherit" disableElevation className={classes.actionBtn}>
              Cancel
            </Button>
            <Button onClick={() => addShipments()} disabled={pulling} variant="contained" color="primary" disableElevation className={classes.actionBtn}>
              {!pulling && <span>Add</span>}
              {pulling && <CircularProgress color="primary" size={24} />}
            </Button>
          </Box>
        </DialogActions>
        {error && <Box className={classes.error}>{error}</Box>}
      </SimpleModal>

      <SimpleModal open={showConfirmRemove} onClose={() => setShowConfirmRemove(false)}
                   title="Confirmation" centerTitle
      >
        <DialogContent>
          <Box align="center">Are you sure to remove shipment {selectedID} from list?</Box>
        </DialogContent>
        <DialogActions className={clsx(classes.dialogActions, classes.justifyCenter)}>
          <Box>
            <Button onClick={() => setShowConfirmRemove(false)} variant="outlined" color="inherit" disableElevation className={classes.actionBtn}>
              Cancel
            </Button>
            <Button onClick={() => removeShipment(selectedID)} variant="contained" color="secondary" disableElevation className={classes.actionBtn}>
              Remove
            </Button>
          </Box>
        </DialogActions>
      </SimpleModal>

      <SimpleModal open={showError} onClose={closeShowError} title="">
        <DialogContent>
          <Box>
            <Box className={classes.error} p={2}>
              <ErrorIcon fontSize="small" style={{verticalAlign: 'top'}} />
              <Box component="span" px={0.5}>{error}</Box>
            </Box>
            <Box align="center" p={1}>
              <Button onClick={closeShowError} variant="outlined" className={classes.actionBtn}>
                Ok
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </SimpleModal>

      <SimpleModal open={browsing} onClose={() => setBrowsing(false)} maxWidth="lg"
                   title={<Box>
                     <Box component="span" mr={1}>
                       List Recent Frankenroute
                     </Box>
                     <Button variant="outlined" size="small" disableElevation href="/frankenroute">
                       New
                     </Button>
                   </Box>}
      >
        <Box p={2}>
          <ListFrankenRoute clients={clients} />
        </Box>
      </SimpleModal>

      <SimpleModal open={showConfirm} onClose={closeShowConfirm} disableBackdropClick disableEscapeKeyDown
                   title="CONFIRMATION" centerTitle
      >
        <DialogContent style={{paddingBottom: 16}}>
          {solution.nb_unassigned > 0 && (
            <Fragment>
              <Box className={classes.error}>
                <Box mb={1}>Cannot confirm route because there is {solution.nb_unassigned} unassigned shipments.</Box>
                <small>
                  This happen when those shipments are too far or the route is too long.
                  Please consider to leave those unassigned shipments and route the others.
                </small>
              </Box>
            </Fragment>
          )}
          {solution.nb_unassigned < 1 && (
            <Fragment>
              {confirming && (
                <Box align="center" p={1}>
                  <Box p={1}>Confirming route...</Box>
                  <CircularProgress color="primary" />
                </Box>
              )}
              {!confirming && !assignments.length && (
                <Box align="center">
                  <Box p={1}>
                    <Box component="span" px={0.5} style={{fontSize: 18}}>
                      Are you sure to confirm route {prefix ? `${prefix}-${label}` : `${label}`}?
                    </Box>
                    {overBonus && (
                      <Box className={classes.error}>
                        <small>Bonus is ${bonus} which exceeds max bonus allowed and will be ignored.</small>
                      </Box>
                    )}
                  </Box>
                  <Box>
                    <FormControlLabel
                      control={<Checkbox checked={keepLabel} onChange={() => setKeepLabel(!keepLabel)}/>}
                      label="Keep shipments label"
                    />
                  </Box>
                  <Box p={1}>
                    <Button onClick={closeShowConfirm} variant="outlined" className={classes.actionBtn}>
                      Cancel
                    </Button>
                    <Button onClick={confirmRoute} variant="contained" disableElevation color="primary" className={classes.actionBtn}>
                      Confirm
                    </Button>
                  </Box>
                </Box>
              )}
              {!confirming && !!assignments.length && (
                <Box align="center" p={1}>
                  {assignments.map(a => (
                    <Box>
                      <Box pb={0.5}>
                        Route {a.label} has successfully confirmed!
                      </Box>
                      <Box p={0.5}>
                        <Box component="small">Assignment ID: <strong className={classes.header}>{a.id}</strong></Box>
                        <Box component="small" px={1}>Label: <strong className={classes.header}>{a.label}</strong></Box>
                      </Box>
                      <Box p={1}>
                        <Button href={`/routes/${moment(a.predicted_start_ts).format("YYYY-MM-DD")}/${a.region_code}/all/${a.id}`} target="_self"
                                size="small" variant="contained" disableElevation color="primary" className={classes.actionBtn} style={{margin: 0}}>
                          View Route
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
              {confirmError && (
                <Box className={classes.error} p={1}>
                  <small>{confirmError}</small>
                </Box>
              )}
            </Fragment>
          )}
        </DialogContent>
      </SimpleModal>

      <SimpleModal open={showIDs} onClose={() => setShowIDs(false)}
                   title="List Shipment ID" centerTitle
      >
        <DialogContent>
          <Box align="center" p={1}>
            {shipments.map(sh => sh.id).join(", ")}
          </Box>
        </DialogContent>
      </SimpleModal>
    </Box>
  )
}

export default Frankenroute;
