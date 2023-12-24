import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Box } from '@material-ui/core';

import AxlSearchBox from '../AxlSearchBox';
import { Container, SearchContainer } from './styles';
import { getEventTemplate } from '../../stores/api';
import { tranformEventMap } from '../../Utils/events';
import MutacheEvent from '../MustacheEvent';
import { EVENT_TEMPLATE_OWNERS, EVENT_TEMPLATE_TARGETS } from '../../constants/eventTemplate';


const HistoryList = ({ getEventList, historyId, isSearch, targets, owners, filterEvent, isReverse = true}) => {
  const [eventMap, setEventMap] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchContentList = async () => {
    setLoading(true)
    const [events, templates] = await Promise.all([getEventList(historyId), getEventTemplate([EVENT_TEMPLATE_TARGETS.DEFAULT, ...targets], [EVENT_TEMPLATE_OWNERS.DEFAULT, ...owners])]);
    let dataEvents = _.filter(events.data, filterEvent);
    dataEvents = isReverse ? _.sortBy(dataEvents, (e) => -e.ts) : _.sortBy(dataEvents, (e) => e.ts);
    let date = '';
    setEventMap(tranformEventMap(date, dataEvents, templates));
    setLoading(false)
  }

  useEffect(() => {
    fetchContentList()
  }, [historyId])

  return <Container>
    {isSearch ? <SearchContainer>
      <AxlSearchBox theme={`default`} placeholder="Search..." defaultValue={``} style={{ width: '100%' }} />
    </SearchContainer> : null}
    {loading ? <div>loading ...</div> : <Box className='event-template'>
      <MutacheEvent eventMap={eventMap} isWithoutSecond={true}/>
    </Box>}
  </Container>
}
export {
  HistoryList
}
