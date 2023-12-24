import moment from "moment";

const RELATIVE_FORMATS = {
  sameDay: 'hh:mm A [Today]',
  nextDay: 'hh:mm A [Tomorrow]',
  nextWeek: 'hh:mm A [next] dddd',
  lastDay: 'hh:mm A [Yesterday]',
  lastWeek: 'hh:mm A [last] dddd',
  sameElse: 'hh:mm A on MMM DD'
};

const ABSOLUTE_FORMAT = 'hh:mm A on MMM DD';

export const isoToLocalHuman = (inputIsoString, timezone, referenceIsoString, format) => isToday(timezone, referenceIsoString) ?
  isoToRelativeHuman(inputIsoString, timezone, referenceIsoString) :
  isoToAbsoluteHuman(inputIsoString, timezone, format);

export const isoToRelativeHuman = (inputIsoString, timezone, referenceIsoString) =>
  moment(inputIsoString).tz(timezone).calendar(referenceIsoString, RELATIVE_FORMATS);

export const isoToAbsoluteHuman = (inputIsoString, timezone, format) =>
  moment(inputIsoString).tz(timezone).format(format || ABSOLUTE_FORMAT);

export const isToday = (timezone, isoString) =>
  moment().tz(timezone).format('YYYY-MM-DD') === moment(isoString).tz(timezone).format('YYYY-MM-DD');

export const toHoursAndMinutes= (mins, isAMPM) => {
    if (mins >= 24 * 60 || mins < 0) {
        throw new RangeError("Valid input should be greater than or equal to 0 and less than 1440.");
    }
    const h = mins / 60 | 0;
    const m = mins % 60 | 0;
    if(isAMPM){
      if(!mins) return 'N/A'
      return moment.utc().hours(h).minutes(m).format("hh:mm A");
    }
    return moment.utc().hours(h).minutes(m).format("HH:mm");
}