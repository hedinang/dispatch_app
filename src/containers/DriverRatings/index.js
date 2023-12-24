import React, { Fragment, useEffect, useState } from 'react';

import { Box, CircularProgress, IconButton, Tooltip, makeStyles } from '@material-ui/core';
import CachedIcon from '@material-ui/icons/Cached';
import StarIcon from '@material-ui/icons/Star';
import StarOutlineIcon from '@material-ui/icons/StarOutline';
import _ from 'lodash';
import momentTz from 'moment-timezone';
import { toast } from 'react-toastify';

import AxlPaperMetrics from '../../components/AxlPaperMetrics';
import AxlPaperRowMetrics from '../../components/AxlPaperRowMetrics';
import AxlPaperSection from '../../components/Paper/Section';
import { stores } from '../../stores';
import colors from '../../themes/colors';

const useStyles = makeStyles({
  tooltip: {
    color: '#000',
    backgroundColor: '#fff',
    fontFamily: 'AvenirNext',
    border: '1px solid #ccc',
  },
});

const getColor = (type, percent, ratingDriverType) => {
    const colorRatingFromType = ratingDriverType && ratingDriverType.ratings &&  ratingDriverType.ratings.find(r => r.type === type);
    if (percent < 0 || (colorRatingFromType && colorRatingFromType.colors && colorRatingFromType.colors.length < 3)) return colors.black;
    percent = percent * 100;
    const findColor = colorRatingFromType && colorRatingFromType.colors.find((item, idx) => {
        if(idx == 0) {
            return comparisonOperators(">", "<=", percent, item);
        }
        if(idx == 1) {
            return comparisonOperators(">=", "<=", percent, item);
        }
        if(idx == 2) {
            return comparisonOperators(">", "<", percent, item);
        }
    })
    return findColor ? findColor.hex_code : colors.black;
}

const comparisonOperators = (operatorDown, operatorUp, percent, obj) => {
    if(operatorDown == '>' && operatorUp == '<=') {
        if(percent > obj.percent_range[0] && percent <= obj.percent_range[1]) return obj 
    }
    if((operatorDown == '>=' && operatorUp == '<=') || (operatorDown == '=' && operatorUp == '=')) {
        if(percent >= obj.percent_range[0] && percent <= obj.percent_range[1]) return obj 
    }
    if(operatorDown == '>' && operatorUp == '<') {
        if(percent > obj.percent_range[0] && percent < obj.percent_range[1]) return obj 
    }
}

const calculateStar = (limitStar, ranking) => {
  if(!ranking) return 0;
  if(ranking > limitStar) return ranking;

  return limitStar + 1 - ranking;
}

function DriverRatings({data, driverInfo, setMetricsInfo}) {
    if(_.isEmpty(data)) return null;
    const [isLoading, setIsLoading] = useState(false);
    const [colorConfigRatingInfo, setColorConfigRatingInfo] = useState([]);
    const [isReloadCached, setIsReloadCached] = useState(false);
    const classes = useStyles();

    const {customer_satisfaction, on_time_pickup, on_time_delivery, completion_rate, csat_ranking } = data;
    const { couriers, id } = driverInfo;
    const driverType = couriers && couriers.length > 0 ? 'DSP' : 'IC';

    useEffect(() => {
        setIsLoading(true);
        stores.driverRatingConfig.getColorConfigRating().then(res => {
            if(res.ok) {
                setColorConfigRatingInfo(res.data);
            }
            else {
                setColorConfigRatingInfo([]);
            }
            setIsLoading(false);
        });
    }, [])

    if(isLoading) return <CircularProgress color='primary' thickness={1}/>

    const handleReloadCache = () => {
      setIsReloadCached(true);
      stores.driverRatingConfig.reloadCachedByDriverID(id).then(res => {
        if(!res.ok) {
          toast.error(res && res.data && res.data.message || 'Something went wrong!', {containerId: 'main'});
          return;
        }
        setMetricsInfo(res.data);
        setIsReloadCached(false);
      });
    }

    const ratingFromDriverType = colorConfigRatingInfo.find(r => r.driver_type === driverType);
    const ranking = _.get(csat_ranking, 'ranking', 0);
    const config = _.get(csat_ranking, 'ranking_config', {});
    const color = _.get(csat_ranking, 'color', '#000');
    const updatedAt = _.get(csat_ranking, 'statistic_at', null);
    const timezone = _.get(csat_ranking, 'timezone', null);
    const entriesConfig = Object.entries(config);
    const limitStar = +_.max(Object.keys(config));
    const numStar = calculateStar(limitStar || 3, ranking);
    const configDesc = entriesConfig && entriesConfig.sort((a, b) => -a[0].localeCompare(b[0]));

    const dataRatings = [
        {
            title: 'Customer Ratings', 
            value: isReloadCached 
              ? <CircularProgress size={16}/> 
              : <Box display={'flex'} alignItems={'center'}>
                  <Box display={'inline-flex'} mr={1} color={'#000'} alignItems={'center'}>
                    <Tooltip title="Reload cache">
                      <IconButton size='small' style={{padding: 0, marginRight: 8}} onClick={handleReloadCache}>
                        <CachedIcon fontSize='small'/>
                      </IconButton>
                    </Tooltip>
                    <Box display={'inline-flex'} position={'relative'}>
                      <Tooltip 
                        title={
                          <Fragment>
                            <Box textAlign={'center'} fontWeight={700} mb={1}>CSAT Rating</Box>
                            {configDesc.map(([k, v], i) => (
                              <Box 
                                key={i} 
                                fontWeight={k == numStar ? 700 : 'normal'}
                                color={k == numStar ? color : 'inherit'}
                                marginBottom={1}
                              >
                                <Box width={35} display={'inline-block'}>{k} {parseInt(k) > 1 ? 'stars' : 'star'}</Box>: {config[calculateStar(limitStar, +k)]}
                              </Box>
                            ))}
                            {updatedAt && <Box>Data record at: {momentTz.tz(updatedAt, timezone || momentTz.tz.guess()).format("MM/DD/YYYY HH:mm:ss z")}</Box>}
                          </Fragment>
                        }
                        classes={{tooltip: classes.tooltip}}
                      >
                        <Box>
                          {Array.from({length: limitStar || 3}, (_, idx) => `${++idx}`).map((star, i) => {
                            if (star <= numStar) return <StarIcon htmlColor='#f0a323' fontSize='small' key={i}/>
                            return <StarOutlineIcon fontSize='small' key={i}/>
                          })}
                        </Box>
                      </Tooltip>
                    </Box>
                  </Box>
                  {_.get(customer_satisfaction, 'formatted', 0)}
                </Box>,
            color: getColor('CUSTOMER_RATING', _.get(customer_satisfaction, 'value', 0), ratingFromDriverType),
        },
        {
            title: 'On Time Pickup', 
            value: _.get(on_time_pickup, 'formatted', 0),
            color: getColor('ON_TIME_PICKUP', _.get(on_time_pickup, 'value', 0), ratingFromDriverType),
        }, 
        {
            title: 'On Time Delivery', 
            value: _.get(on_time_delivery, 'formatted', 0),
            color: getColor('ON_TIME_DELIVERY', _.get(on_time_delivery, 'value', 0), ratingFromDriverType),
        }, 
        {
            title: 'Completion Rate', 
            value: _.get(completion_rate, 'formatted', 0),
            color: getColor('COMPLETION_RATE', _.get(completion_rate, 'value', 0), ratingFromDriverType),
        }, 
    ]

  return (
    <Box>
        <AxlPaperMetrics title={'Ratings'}>
            <AxlPaperSection>
                {dataRatings.map((item, idx) => (
                    <AxlPaperRowMetrics title={item.title} value={item.value} key={idx} 
                      styles={{
                        value: {
                            color: item.color,
                            fontWeight: 'bold'
                        }
                    }}/>
                ))}
            </AxlPaperSection>
        </AxlPaperMetrics>
    </Box>
  )
}

export default DriverRatings