import _ from 'lodash';

export const MILE_TO_METER = 1609.34;

export const convertMileToMeter = (val, decimal_number = 1) => {
  return (val * MILE_TO_METER).toFixed(decimal_number);
};

export const convertMeterToMile = (val, decimal_number = 1) => {
  return (val / MILE_TO_METER).toFixed(decimal_number);
};

export const DISPOSITION_DATE_FORMAT = 'MM/DD/YYYY';
export const DISPOSITION_DATETIME_FORMAT = 'MM/DD/YYYY HH:mm';

export const REQUEST_STATUS_IDLE = 'IDLE';
export const REQUEST_STATUS_LOADING = 'LOADING';
export const REQUEST_STATUS_LOADED = 'LOADED';

export const PERMISSION_DENIED_TEXT = "You don't have permission to perform this action";

export const ASSIGN_BTN_TEXT = 'ASSIGN';
export const UNASSIGN_BTN_TEXT = 'UNASSIGN';
export const REASSIGN_BTN_TEXT = 'REASSIGN';
export const ROUTE_ASSIGN_DSP_BTN_TEXT = 'ASSIGN DSP';

export const DRIVER_SEARCH_ASSIGNMENT = 'ASSIGNMENT';
export const DRIVER_SEARCH_TICKET = 'TICKET';

export const APARTMENT_COMPLEX = 'APARTMENT_COMPLEX';
export const COMMERCIAL_BUILDING = 'COMMERCIAL_BUILDING';
export const ADDRESS_NOT_ACCESSIBLE = 'ADDRESS_NOT_ACCESSIBLE';

export const isMatchPattern = ({ uri, compareUri, method, compareMethod }) => {
  const splitted = _.trim(uri, '/').split('/');

  const splittedPattern = _.trim(compareUri, '/').split('/');

  if (splitted.length !== splittedPattern.length) return false;

  const isVariablePattern = /^{.*}$/;

  const regexList = splittedPattern.map((path) => {
    if (isVariablePattern.test(path)) return new RegExp('.', 'g');

    return new RegExp(`^${path}$`, 'g');
  });

  const isMatched = regexList.every((regex, index) => regex.test(splitted[index]));

  return method && compareMethod ? isMatched && method.toUpperCase() === compareMethod.toUpperCase() : isMatched;
};

export const isDeniedAction = (actionPatterns, deniedPatterns) => {
  if (_.isEmpty(actionPatterns) || _.isEmpty(deniedPatterns) || !_.isArray(actionPatterns) || !_.isArray(deniedPatterns)) return false;

  return actionPatterns.some((pattern) => deniedPatterns.some((deniedPattern) => isMatchPattern({ uri: pattern.path, compareUri: deniedPattern.path, method: pattern.method, compareMethod: deniedPattern.method })));
};
