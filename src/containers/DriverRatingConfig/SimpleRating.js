import React from 'react';
import { Box, Typography } from '@material-ui/core';
import AxlPaper from '../../components/Paper';
import AxlPaperRow from '../../components/Paper/Row';
import AxlPaperSection from '../../components/Paper/Section';
import Formular from './Formular';

const FORMULAR_LIFETIME_ROUTE = {
  content: '= Count of all routes accepted and claimed even if it was not closed'
}

const FORMULAR_LIFETIME_STOP = {
  content: '= Count of all stops whethere it was completed or failed'
}

const FORMULAR_LIFETIME_MILE = {
  content: '= Count of all estimated miles only if route was closed'
}

const FORMULAR_HOUR_WORKED = {
  content: '= Travel time + Service time + Pickup time'
}

const getFormular = (type) => {
  switch (type) {
    case 'LIFETIME_ROUTE':
      return FORMULAR_LIFETIME_ROUTE

    case 'LIFETIME_STOP':
      return FORMULAR_LIFETIME_STOP

    case 'LIFETIME_MILE':
      return FORMULAR_LIFETIME_MILE

    default:
      return FORMULAR_HOUR_WORKED
  }
}

function SimpleRating({title, display, type}) {
  const formular = getFormular(type)

  return (
    <AxlPaper title={title} styles={{title: {fontSize: 22, fontWeight: 600, color:'#13101f'}}}>
      {!!formular && <Formular numberator={formular.content}/>}
      <AxlPaperRow label={'Display'} value={display} styles={{value:{fontWeight:'bold'}, root:{marginBottom: 0}}}></AxlPaperRow>
    </AxlPaper>
  );
}

export default SimpleRating;