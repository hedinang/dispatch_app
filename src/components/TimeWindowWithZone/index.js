import React from "react";
import _ from "lodash";
import moment from "moment-timezone";
import * as E from "./styles";


export default class TimeWindowWithZone extends React.Component {
  render() {
    const {startTs, endTs, timezone} = this.props;
    if (!startTs || !endTs) {
      return <div />;
    }

    // Timezone
    let t1 = '', t2 = '', tz2 = '', t3 = '', t4 = '', tz4 = '', showDiffDay = '';
    const defaultTimezone = _.defaultTo(timezone, moment.tz.guess());
    const isSameTimezone = moment.tz(defaultTimezone).utcOffset() === moment.tz(moment.tz.guess()).utcOffset();
    const isDiffDay   = moment.tz(startTs, defaultTimezone).diff(moment.tz(moment.tz.guess()), 'days');
    showDiffDay   = isDiffDay !== 0 ? `${isDiffDay > 0 ? ' +' : ''} ${isDiffDay}day${Math.abs(isDiffDay) > 1 ? 's' : ''}` : '';
    t1            = moment.tz(startTs, moment.tz.guess()).format('h:mma'),
    t2            = moment.tz(endTs, moment.tz.guess()).format('h:mma'),
    tz2           = moment.tz(endTs, moment.tz.guess()).format('z'),
    t3            = moment.tz(startTs, defaultTimezone).format('h:mma'),
    t4            = moment.tz(endTs, defaultTimezone).format('h:mm a'),
    tz4           = moment.tz(endTs, defaultTimezone).format('z');

    return <E.Text_1>
      <div>[{t1} - {t2} <E.TimeZoneText>{tz2}</E.TimeZoneText>]</div>
      <div>
        {!isSameTimezone ? <span>[{t3} - {t4} <E.TimeZoneText>{tz4}</E.TimeZoneText>]</span> : ''}
        <E.DayText>{showDiffDay}</E.DayText>
      </div>
    </E.Text_1>
  }
}