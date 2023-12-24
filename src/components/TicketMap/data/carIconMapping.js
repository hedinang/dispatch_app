export const CAR_ICON_MAPPING = {
  car: {x: 0, y: 50, width: 100, height: 50, anchorY: 25},
  red: {x: 0, y: 0, width: 100, height: 50, anchorY: 25},
  white: {x: 0, y: 50, width: 100, height: 50, anchorY: 25},
  blue: {x: 0, y: 150, width: 100, height: 50, anchorY: 25},
  silver: {x: 0, y: 150, width: 100, height: 50, anchorY: 25},
  black: {x: 0, y: 200, width: 100, height: 50, anchorY: 25},
  gray: {x: 0, y: 250, width: 100, height: 50, anchorY: 25},
  gold: {x: 0, y: 300, width: 100, height: 50, anchorY: 25},
  burgundy: {x: 0, y: 350, width: 100, height: 50, anchorY: 25},
  brown: {x: 0, y: 400, width: 100, height: 50, anchorY: 25},
  green: {x: 0, y: 450, width: 100, height: 50, anchorY: 25},
  aqua: {x: 0, y: 500, width: 100, height: 50, anchorY: 25},
  cream: {x: 0, y: 750, width: 100, height: 50, anchorY: 25},
}

export const DETECT_CAR_COLOR = (driver) => {
  if (!driver || !driver.vehicle_color || driver.vehicle_color.toLowerCase().indexOf('white') >=0) return 'white'
  if (driver.vehicle_color.toLowerCase().indexOf('silver') >=0 || driver.vehicle_color.toLowerCase().indexOf('sliver') >=0) return 'silver'
  if (driver.vehicle_color.toLowerCase().indexOf('red') >=0) return 'red'
  if (driver.vehicle_color.toLowerCase().indexOf('blue') >=0) return 'blue'
  if (driver.vehicle_color.toLowerCase().indexOf('black') >=0) return 'black'
  if (driver.vehicle_color.toLowerCase().indexOf('charcoal') >=0) return 'black'
  if (driver.vehicle_color.toLowerCase().indexOf('gray') >=0) return 'gray'
  if (driver.vehicle_color.toLowerCase().indexOf('grey') >=0) return 'gray'
  if (driver.vehicle_color.toLowerCase().indexOf('gold') >=0) return 'gold'
  if (driver.vehicle_color.toLowerCase().indexOf('burgundy') >=0) return 'burgundy'
  if (driver.vehicle_color.toLowerCase().indexOf('brown') >=0) return 'brown'
  if (driver.vehicle_color.toLowerCase().indexOf('green') >=0) return 'green'
  if (driver.vehicle_color.toLowerCase().indexOf('aqua') >=0) return 'aqua'
  if (driver.vehicle_color.toLowerCase().indexOf('cream') >=0) return 'cream'
  console.log(driver.vehicle_color)
  return 'white'
}
