import React, { useEffect, useState } from 'react';

import _ from 'lodash';
import { Box, Button, CircularProgress, IconButton, TextField, Tooltip } from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';

import { getEventTemplate } from '../../stores/api';
import { tranformEventMap } from '../../Utils/events';
import MutacheEvent from '../MustacheEvent';
import { EVENT_TEMPLATE_OWNERS, EVENT_TEMPLATE_TARGETS } from '../../constants/eventTemplate';
import AxlAutocomplete from '../AxlAutocomplete';


const EventTemplates = ({ getEventList, historyId, canSearch, targets, owners, filterEvent, isReverse = true, 
  isWithoutSecond = true, urlParams = null, canRefresh = false, canFilter = false, filterFields = [], containerStyles
}) => {
  const [eventMap, setEventMap] = useState([]);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [events, setEvents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [refresh, setRefresh] = useState(false);

  const fetchContentList = async () => {
    setLoading(true)
    const [events, templates] = await Promise.all([getEventList(historyId, urlParams), getEventTemplate([EVENT_TEMPLATE_TARGETS.DEFAULT, ...targets], [EVENT_TEMPLATE_OWNERS.DEFAULT, ...owners])]);
    let dataEvents = _.filter(events.data, filterEvent);
    dataEvents = isReverse ? _.sortBy(dataEvents, (e) => -e.ts) : _.sortBy(dataEvents, (e) => e.ts);
    let date = '';
    setEvents(dataEvents);
    setTemplates(templates);
    setEventMap(tranformEventMap(date, dataEvents, templates));
    const mapFields = (evt) => [...filterFields, 'action'].map(field => evt[field]).join("|");
    setOptions(_.uniqBy(dataEvents, evt => mapFields(evt)).map(evt => ({
      ...evt,
      value: mapFields(evt),
      label: mapFields(evt),
    })))
    setLoading(false)
  }

  useEffect(() => {
    fetchContentList()
  }, [historyId, refresh])

  const handleChange = (opts) => {
    setSelectedOptions(opts);
    let date = '';
    const filterEvents = _.isEmpty(opts) 
      ? events 
      : _.filter(events, (event) => {
          const optSelected = _.map(opts, opt => opt.value);
          const mapFields = [...filterFields, 'action'].map(field => event[field]).join("|");
          return optSelected.includes(mapFields);
        });
    setEventMap(tranformEventMap(date, filterEvents, templates));
  }

  return <Box display={'flex'} flexDirection={'column'} height={'100%'}>
    <Box display={'flex'} justifyContent={'space-between'} style={{gap: 8}}>
      <Box display={'flex'} flexDirection={'column'} flex={1} style={{gap: 8}}>
        {canSearch && <TextField variant='outlined' size='small' style={{backgroundColor: '#fff'}} placeholder='Search'/>}
        {canFilter && (
          <Box mb={1}>
            <AxlAutocomplete
              multiple
              options={_.sortBy(options, opt => opt.value)}
              onChange={(_, selected) => handleChange(selected)}
              value={selectedOptions}
              getOptionLabel={(option) => option.label}
              getOptionSelected={(opt, val) => opt.id === val.id || ''}
              limitTags={1}
              placeholder='Filter'
              style={{backgroundColor: '#fff'}}
            />
          </Box>
        )}
      </Box>
      {canRefresh && (
        <Box flexGrow={0}>
          <Tooltip title="Refresh history">
            <IconButton size='small' style={{border: '1px solid #ccc', backgroundColor: '#fff', borderRadius: '4px', padding: 5}} onClick={() => !loading && setRefresh(!refresh)} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
    <Box className='event-template' style={containerStyles}>
      {loading 
        ? <Box display={'flex'} justifyContent={'center'} mt={2}><CircularProgress size={24}/></Box>
        : _.isEmpty(eventMap)
          ? <Box display={'flex'} justifyContent={'center'} mt={2} fontFamily={'AvenirNext'} fontWeight={500} fontSize={14}>No history</Box>
          : <MutacheEvent eventMap={eventMap} isWithoutSecond={isWithoutSecond}/>
      }
    </Box>
  </Box>
}
export {
  EventTemplates
}