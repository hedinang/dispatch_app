import React, { Fragment, useState } from 'react'

import { isEmpty, toLower, startCase } from 'lodash';
import { Box, IconButton, Tooltip } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';

import AxlDialog from '../AxlDialog';
import QuestionnaireDetail from './questionnaireDetail';

export const addressTypes = {
  SINGLE_HOUSE: 'SINGLE_HOUSE',
  APARTMENT_COMPLEX: 'APARTMENT_COMPLEX',
  COMMERCIAL_BUILDING: 'COMMERCIAL_BUILDING',
}

export const addressCharacteristicType = {
  HOUSE_GATED: 'HOUSE_GATED',
  GATED: 'GATED',
  HIGH_RISE: 'HIGH-RISE',
}

export const deliveredReasons = {
  RECEPTION: 'RECEPTION',
  SECURITY: 'SECURITY',
  SIDE_DOOR: 'SIDE_DOOR',
  OTHER: 'OTHER',
}

const filterByType = (addressType, questionnaireList = []) => {
  if(questionnaireList && questionnaireList.length < 1) return [];
   
  switch (addressType) {
    case addressTypes.SINGLE_HOUSE:
      return questionnaireList
              .filter(ql => [addressCharacteristicType.HOUSE_GATED].includes(ql.type))
              .map(ql => startCase(toLower(ql.type.replace(["_", "-"], " "))));
    
    case addressTypes.APARTMENT_COMPLEX:
    case addressTypes.COMMERCIAL_BUILDING:
      return questionnaireList
              .filter(ql => [addressCharacteristicType.GATED, addressCharacteristicType.HIGH_RISE].includes(ql.type))
              .map(ql => startCase(toLower(ql.type.replace(["_", "-"], " "))));
    
    default:
      return [];
  }
}

const sectionDeliveryReason = (addressType, deliveryReason) => {
  if(!deliveryReason) return null;
  
  if (
    ([addressTypes.SINGLE_HOUSE].includes(addressType) && ![deliveredReasons.SECURITY, deliveredReasons.RECEPTION].includes(deliveryReason))
    || ([addressTypes.APARTMENT_COMPLEX, addressTypes.COMMERCIAL_BUILDING].includes(addressType) && ![deliveredReasons.SIDE_DOOR].includes(deliveryReason))
  ) {
    return (
      <Box display={'flex'} fontWeight={600}>
        <Box display={'inline-flex'} color={'#96979a'} fontSize={12} fontWeight={700} mr={1}>Preferred dropoff location: </Box>
        <Box>{startCase(toLower(deliveryReason.replace(["_", "-"], " ")))}</Box>
      </Box>
    )
  }
  return null;
}

function QuestionnaireInfo({questionnaireInfo, shipment}) {
  const [isOpenAddressInfo, setIsOpenAddressInfo] = useState(false);

  if(isEmpty(questionnaireInfo)) return null;

  const { recipient_questionnaire } = questionnaireInfo;

  if(isEmpty(recipient_questionnaire)) return null;
  const {address_type, address_characteristic, delivery_reason} = recipient_questionnaire;

  const filterSelected = address_characteristic && address_characteristic.length > 0 && address_characteristic.filter(ac => ac.is_selected);
  const questionnaireList = filterByType(address_type, filterSelected) || [];


  return (
    <Fragment>
      <Box bgcolor={'#fff'} borderRadius={4} px={2} py={1} mb={1.25} fontFamily={'AvenirNext'}>
        <Box display={'flex'}>
          <Box color={'#96979a'} fontSize={12} fontWeight={700} mr={1}>Address Info:</Box>
          <Box display={'flex'} fontWeight={600} flex={1} style={{gap: 32}}>
            {address_type && <Box>{startCase(toLower(address_type.replace(["_", "-"], " ")))}</Box>}
            <Box> {questionnaireList.join(", ")} </Box>
          </Box>
          <Box mt={-0.625}>
            <Tooltip title="Show address questionnaire">
              <IconButton size='small' onClick={() => setIsOpenAddressInfo(true)}>
                <InfoIcon fontSize='small' htmlColor='#887fff'/>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        {sectionDeliveryReason(address_type, delivery_reason)}
      </Box>

      {isOpenAddressInfo && questionnaireInfo && <AxlDialog
        isOpen={isOpenAddressInfo}
        childrenTitle={'Address Questionnaire'}
        children={<QuestionnaireDetail questionnaireInfo={questionnaireInfo} shipment={shipment}/>}
        handleClose={() => setIsOpenAddressInfo(false)}
        maxWidth='sm'
      />}
    </Fragment>
  )
}

export default QuestionnaireInfo