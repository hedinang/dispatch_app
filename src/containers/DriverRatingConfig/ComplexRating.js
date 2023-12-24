import React from 'react';
import { Box, Typography } from '@material-ui/core';
import AxlPaper from '../../components/Paper';
import AxlPaperRow from '../../components/Paper/Row';
import AxlPaperSection from '../../components/Paper/Section';
import Formular from './Formular';

const FORMULAR_CUSTOMER_RATING = {
  numberator: 'No. delivered within thumbs up + no. deliveries with tips',
  denominator: 'Total no. deliveries with feedback = (no. of feedback with thumbs up + no. of feedback with thumbs down + no. of deliveries with tips + no. of deliveries with internal feedback thumbs up and down)'
}

const FORMULAR_ON_TIME_PICKUP = {
  numberator: 'No. routes with arrival within pickup window and claimed and accepted',
  denominator: 'Total no. tickets + direct book routes'
}

const FORMULAR_ON_TIME_DELIVERY = {
  numberator: 'No. packages delivered within delivery window',
  denominator: 'Total no. packages with successful pickup'
}

const FORMULAR_COMPLETION_RATE = {
  numberator: 'No. packages marked as success',
  denominator: 'Total no. packages picked up successfuly = (no. successful packages + no. failed packages + no. lost packages)'
}

const getFormular = (type) => {
  switch (type) {
    case 'CUSTOMER_RATING':
      return FORMULAR_CUSTOMER_RATING

    case 'ON_TIME_PICKUP':
      return FORMULAR_ON_TIME_PICKUP

    case 'ON_TIME_DELIVERY':
      return FORMULAR_ON_TIME_DELIVERY

    default:
      return FORMULAR_COMPLETION_RATE
  }
}

function ComplexRating({title, ratings, colors, type}) {
  const formular = getFormular(type)

  return (
    <AxlPaper title={title} styles={{title: {fontSize: 22, fontWeight: 600, color:'#13101f'}}}>
      {!!formular && <Formular 
                      numberator={formular.numberator}
                      denominator={formular.denominator}/>}
      <AxlPaperSection styles={{marginBottom: 45}}>
        {ratings.map((rating, i) => {
          if (!rating.val) return <Box key={i} sx={{height:22}} />
          
          return <AxlPaperRow key={i} label={rating.label} value={rating.val} styles={{value:{fontWeight:600}}}></AxlPaperRow>
        })}
      </AxlPaperSection>

      <AxlPaperSection>
        <Typography style={{color:'#5a5a5a', textAlign: 'left', textDecoration: 'underline', fontWeight: '500', fontSize: '16px'}}>Color Display</Typography>
        {colors.map((rating, i) => {
          return <AxlPaperRow key={i}
            styles={{label:{color: rating.color, fontWeight:600}, value: {fontWeight:600}, root:{marginBottom: i == colors.length ? 0 : 'inherit'}}}
            label={rating.label}
            value={
                <Box sx={{display:'flex', justifyContent:'space-between', width: 100, color:rating.color}}>
                  <Box>{rating.operator}</Box>
                  <Box>{rating.val}</Box>
                </Box>
          } />
        })}
      </AxlPaperSection>
    </AxlPaper>
  );
}

export default ComplexRating;