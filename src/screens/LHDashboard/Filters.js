import React, { useEffect, useState } from 'react';

import _ from 'lodash';
import moment from 'moment';
import { Box, IconButton, makeStyles } from '@material-ui/core';
import { toast } from 'react-toastify';
import { compose } from 'recompose';
import { inject } from 'mobx-react';
import CloseIcon from '@material-ui/icons/Close';

import { getOrigins, getDestinations } from '../../stores/api';
import AxlDatePicker from '../../components/AxlDatePicker';
import AxlAutocomplete from '../../components/AxlAutocomplete';
import useSearchParams from '../../hooks/useSearchParams';
import { LINEHAUL_DELIMITER, LINEHAUL_TYPES } from '../../constants/linehaul';

const useStyles = makeStyles({
  root: {
    display: 'grid',
    maxWidth: '1920px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
    gap: '0.5rem',
    marginBottom: '2rem',
    align: 'center',
    flex: 1,
  },
});

function Filters(props) {
  const classes = useStyles();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const injectionDate = searchParams.get('injection_date');

  const clientIDs = searchParams.get('client_ids');
  const filteredClientIDs = clientIDs ? clientIDs.split(LINEHAUL_DELIMITER).map(Number) : [];
  const linehaulTypes = searchParams.get('linehaul_types');
  const filteredLinehaulTypes = linehaulTypes ? linehaulTypes.split(LINEHAUL_DELIMITER) : [];
  const [originOptions, setOriginOptions] = useState([]);
  const [destinationOptions, setDestinationOptions] = useState([]);
  const clients = props && props.clientStore && props.clientStore.clients;
  const clientOptions = _.uniqBy(
    _.map(clients, (client) => ({ value: client.client_id, label: client.name })),
    'value',
  );

  const destinationIDs = searchParams.get('delivery_regions');
  const originIDs = searchParams.get('pickup_regions');

  const [selectedOriginIDs, setSelectedOriginIDs] = useState([]);
  const [selectedDestinationIDs, setSelectedDestinationIDs] = useState([]);
  const selectedClients = clientOptions.filter((option) => filteredClientIDs.includes(option.value));
  const selectedLinehaulTypes = LINEHAUL_TYPES.filter((option) => filteredLinehaulTypes.includes(option.value));

  useEffect(() => {
    setIsLoading(true);
    if (destinationOptions && destinationOptions.length > 0) {
      if (destinationIDs && destinationIDs.length > 0) {
        setSelectedDestinationIDs(destinationOptions.filter((option) => destinationIDs.split(LINEHAUL_DELIMITER).includes(option.value)));
      } else {
        setSelectedDestinationIDs([]);
      }
    } else {
      getDestinations()
        .then((res) => {
          if (res.status === 200) {
            setDestinationOptions(res.data);
            if (destinationIDs && destinationIDs.length > 0) {
              setSelectedDestinationIDs(res.data.filter((option) => destinationIDs.split(LINEHAUL_DELIMITER).includes(option.value)));
            } else {
              setSelectedDestinationIDs([]);
            }
          } else {
            setDestinationOptions([]);
            setSelectedDestinationIDs([]);
            toast.error(res.message);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }

    if (originOptions && originOptions.length > 0) {
      if (originIDs && originIDs.length > 0) {
        setSelectedOriginIDs(originOptions.filter((option) => originIDs.split(LINEHAUL_DELIMITER).includes(option.value)));
      } else {
        setSelectedOriginIDs([]);
      }
    }
    else {
      getOrigins()
        .then((res) => {
          if (res.status === 200) {
            setOriginOptions(res.data);
            if (originIDs && originIDs.length > 0) {
              setSelectedOriginIDs(res.data.filter((option) => originIDs.split(LINEHAUL_DELIMITER).includes(option.value)));
            } else {
              setSelectedOriginIDs([]);
            }
          } else {
            setOriginOptions([]);
            setSelectedOriginIDs([]);
            toast.error(res.message);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [originIDs, destinationIDs]);

  const handleChangeDate = (value) => {
    if (!value) {
      searchParams.delete('injection_date');
    } else {
      searchParams.set('injection_date', moment(value).format('YYYY-MM-DD'));
    }

    searchParams.set('page', 0);
    setSearchParams(searchParams);
  };

  const handleSelectMultiple = (selected, field) => {
    const ids = selected.map(({ value }) => value);
    if (_.isEmpty(ids)) {
      searchParams.delete(field);
    } else {
      searchParams.set(field, ids.join(LINEHAUL_DELIMITER));
    }
    searchParams.set('page', 0);
    setSearchParams(searchParams);
  };

  const handleClearDate = () => {
    searchParams.delete('injection_date');
    searchParams.set('page', 0);
    setSearchParams(searchParams);
  }

  return (
    <div className={classes.root}>
      <Box position={'relative'}>
        <AxlDatePicker
          label="Injection Date"
          onChange={handleChangeDate}
          format="MM/dd/yyyy"
          value={injectionDate ? moment(injectionDate) : null}
        />
        {injectionDate && <IconButton size="medium" aria-label="clear" style={{position: 'absolute', top: 17, right: 45}} onClick={handleClearDate}> 
          <CloseIcon />
        </IconButton>}
      </Box>
      <AxlAutocomplete
        multiple
        options={originOptions}
        label="Origin"
        onChange={(_, selected) => handleSelectMultiple(selected, 'pickup_regions')}
        value={selectedOriginIDs}
        getOptionLabel={(option) => option.label}
        limitTags={1}
      />
      <AxlAutocomplete
        multiple
        options={destinationOptions}
        label="Destination"
        onChange={(_, selected) => handleSelectMultiple(selected, 'delivery_regions')}
        value={selectedDestinationIDs}
        getOptionLabel={(option) => option.label}
        limitTags={1}
      />
      <AxlAutocomplete
        multiple
        options={clientOptions}
        label="Client Name"
        onChange={(_, selected) => handleSelectMultiple(selected, 'client_ids')}
        value={selectedClients}
        getOptionLabel={(option) => `[${option.value}] ${option.label}`}
        limitTags={1}
      />
      <AxlAutocomplete
        multiple
        options={LINEHAUL_TYPES}
        label="Linehaul Type"
        onChange={(_, selected) => handleSelectMultiple(selected, 'linehaul_types')}
        value={selectedLinehaulTypes}
        getOptionLabel={(option) => option.label}
        limitTags={1}
      />
    </div>
  );
}

export default compose(inject('clientStore'))(Filters);
