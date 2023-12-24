/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable nonblock-statement-body-position */
/* eslint-disable indent */
/* eslint-disable react/no-deprecated */
/* eslint-disable quotes */
/* eslint-disable quote-props */
/* eslint-disable max-classes-per-file */

import React, { useState, useMemo, useEffect } from "react";
import ReactMapGL, { LinearInterpolator } from "react-map-gl";
import DeckGL from "deck.gl";
import { WebMercatorViewport } from "@deck.gl/core";
import { toJS } from "mobx";
import StopToolTip from "./StopToolTip";
import { iconMappingObj, stopColorEncode, renderPath } from "./helper";

const MapCanvas = (props) => {
  const { stops, assignment } = props;

  const [hoverStop, setHoverStop] = useState(null);
  const renderResult = useMemo(() => {
    if (!stops) return [];
    return renderPath(stops, setHoverStop);
  }, [stops]);

  const [viewport, setViewport] = useState({
    width: 400,
    height: 300,
    latitude: 37.7577,
    longitude: -122.4376,
    zoom: 11,
    transitionDuration: 500,
  });

  useEffect(() => {
    if (renderResult) {
      const viewportWeb = new WebMercatorViewport(viewport);
      let minLng = assignment.bbox[0][0];
      let maxLng = assignment.bbox[1][0];
      let minLat = assignment.bbox[0][1];
      let maxLat = assignment.bbox[1][1];
      const vw = maxLng - minLng;
      const vh = maxLat - minLat;
      const gapw = Math.max(vw * 0.1, 0.0004);
      const gaph = Math.max(vh * 0.1, 0.0004);
      const bbox = [
        [minLng - gapw, minLat - gaph],
        [maxLng + gapw, maxLat + gaph],
      ];
      let { longitude, latitude, zoom } = viewportWeb.fitBounds(bbox,{padding: 50});
      setViewport({ ...viewport, longitude, latitude, zoom, transitionDuration: 500 });
    }
  }, [renderResult]);
  return (
    <ReactMapGL
      {...viewport}
      mapStyle={process.env.REACT_APP_MAP_STYLE_URL}
      transitionInterpolator={new LinearInterpolator()}
      onViewportChange={(v) => setViewport(v)}
      width={"100%"}
      height={"100%"}
    >
      <DeckGL viewState={viewport} layers={[...renderResult]} />
      <StopToolTip hoverStop={hoverStop} />
    </ReactMapGL>
  );
};

export default MapCanvas;
