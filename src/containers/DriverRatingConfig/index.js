import React, { useEffect, useState } from 'react';
import { Box, LinearProgress} from '@material-ui/core';
import Header from './Header';
import ComplexRating from './ComplexRating';
import Grid from '@material-ui/core/Grid';
import SimpleRating from './SimpleRating';
import { stores } from '../../stores';
import { useLocation, useHistory} from 'react-router-dom'

Boolean.prototype.convertToStr = function() {
  return this.valueOf() ? 'On' : 'Off'
}

const processColors = (colors) => {
  if (!colors || colors.length < 3) return

  const color1 = colors[0]
  const color2 = colors[1]
  const color3 = colors[2]

  return [
    {label: color1.title, val: color1.percent_range[0]+'%', operator:'>', color: color1.hex_code},
    {label: color2.title, val: `${color2.percent_range[0]} - ${color2.percent_range[1]}%`, operator:'=', color: color2.hex_code},
    {label: color3.title, val: color3.percent_range[1]+'%', operator:'<', color: color3.hex_code},
  ]
}

const TITLE_COMPLEX_RATING = {
  CUSTOMER_RATING: 'Customer Ratings',
  ON_TIME_PICKUP: 'On Time Pickup',
  ON_TIME_DELIVERY: 'On Time Delivery',
  COMPLETION_RATE: 'Completion Rate'
}

const TITLE_SIMPLE_RATING = {
  LIFETIME_ROUTE: 'Lifetime Routes',
  LIFETIME_STOP: 'Lifetime Stops',
  LIFETIME_MILE: 'Lifetime Miles',
  HOURS_WORKED: 'Hours Worked'
}

const MIN_MAX_LABEL = {
  CUSTOMER_RATING : {min: 'Min Feedback', max: 'Last No. of Feedback'},
  ON_TIME_PICKUP  : {min: 'Min Routes', max: 'Last No. of Routes'},
  ON_TIME_DELIVERY: {min: 'Min Packages', max: 'Last No. of Packages'},
  COMPLETION_RATE : {min: 'Min Packages', max: 'Last No. of Packages'},
}

const processConfigs = (configs) => {
  if (!configs) return

  const result = {}
  const complextRatingKeys = Object.keys(TITLE_COMPLEX_RATING)
  configs.forEach(config => {
    const ratingType = config.type
    if (complextRatingKeys.includes(config.type)) {
      result[ratingType] = {rating: [{label: 'Display', val: config.is_display.convertToStr()}, 
                                  {label: MIN_MAX_LABEL[ratingType].min, val: config.min}, 
                                  {label: MIN_MAX_LABEL[ratingType].max, val: config.max},
                                  {label: 'Buffer time/route', val: config.buffer_time_percent ? config.buffer_time_percent+'%': null}],
                          colors: processColors(config.colors)}
    } else {
      result[ratingType] = {display: config.is_display.convertToStr()}
    }
  });
  return result;
}


function DriverRatingConfig(props) {
  const [configs, setConfigs] = useState(null)
  const [loading, setLoading] = useState(false)
  const location = useLocation();
  const history = useHistory();
  const [selectedDriverType, setSelectedDriverType] = useState(() => {
    let params = new URLSearchParams(location.search);
    let type = params.get('type');
    
    return ['IC', 'DSP'].includes(type) ? type: 'IC'
  })

  useEffect(() => {
    setLoading(true)
    stores.driverRatingConfig.listByDriverType(selectedDriverType).then(rsp => {
      if (rsp.ok && rsp.data) {
        setConfigs(rsp.data)
      } else {
        setConfigs(null)
      }
      setLoading(false)
    })
  }, [selectedDriverType]);
  const finalConfigs = processConfigs(configs)
  
  const handleChangeDriverType = (e) => {
    const type = e.target.value
    setSelectedDriverType(type)
    history.push(`driver-rating-config?type=${type}`)
  }

  return (
      <Box sx={{background:'#fff', margin: 30}}>
        {loading && <LinearProgress />}
        <Box sx={{padding:30, fontFamily:'AvenirNext'}}>
          <Header driverType={selectedDriverType} handleChangeDriverType={handleChangeDriverType}/>

          {!!finalConfigs && (<React.Fragment>
            <Grid container spacing={3}>
              {Object.keys(TITLE_COMPLEX_RATING).map(key => {
                return <Grid key={key} item xs={3}>
                        <ComplexRating title={TITLE_COMPLEX_RATING[key]} ratings={finalConfigs[key].rating} colors={finalConfigs[key].colors} type={key}/>
                      </Grid>
              })}
            </Grid>

            <Grid container spacing={3} style={{marginTop:50}}>
              {Object.keys(TITLE_SIMPLE_RATING).map(key => {
                return <Grid key={key} item xs={3}>
                        <SimpleRating title={TITLE_SIMPLE_RATING[key]} display={finalConfigs[key].display} type={key}/>
                      </Grid>
              })}
            </Grid>
          </React.Fragment>)}
        </Box>
      </Box>
  );
}

export default DriverRatingConfig;