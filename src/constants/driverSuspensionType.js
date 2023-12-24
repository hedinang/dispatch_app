import colors from "../themes/colors";

export default {
  delayed: 'DELAYED',
  black_out: 'BLACK OUT',
  client_blacklist: 'CLIENT BLACKLIST',
  reduced_route: 'REDUCED ROUTE',
  limited_reservation: 'LIMITED RESERVATION',
  limited_capacity: 'LIMITED CAPACITY',
}

export const DRIVER_SUSPENSION_STATUS_MAP_TO_COLOR = {
  delayed: colors.blackMain,
  black_out: colors.scarlet,
  client_blacklist: colors.blackMain,
  reduced_route: colors.blackMain,
  limited_reservation: colors.blackMain,
  limited_capacity: colors.blackMain,
}