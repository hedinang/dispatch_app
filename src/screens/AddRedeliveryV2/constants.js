export const COLOR_PALETE = [
  '#0F30D9', '#D55535', '#D46A6A', '#A1C349', '#EF8F77', '#4B4E4D', '#233F88', '#AA7433', '#4498A5', '#3C7A4A', '#5885B0', 
  '#B0171C', '#35AD8D', '#F6546A', '#2C4B25', '#008080', '#F6546A', '#661141', '#1E4B00', '#718DA5', '#387012', '#440026', 
  '#088DA5', '#13073A', '#550000', '#261758', '#801515'
];

export const iconMapping = {};
const iconW = 36;
const iconH = 36;
const iconAnchor = 18;
iconMapping['white'] = {
  x: iconW * 5,
  y: 0,
  width: iconW,
  height: iconH,
  anchorY: iconAnchor,
};

export const mapStyle = process.env.REACT_APP_MAP_STYLE_URL;

export const stringToNumber = (stringInput) => {
  const numberValue = Number(stringInput);
  return isNaN(numberValue) ? 0 : numberValue;
}

export const INITIAL_VIEW_STATE = {
  longitude: -118.38935852050781,
  latitude: 33.851029206367905,
  zoom: 13,
  pitch: 0,
  bearing: 0
};
