import React, { Fragment } from 'react';

import { Box } from '@material-ui/core';
import { toLower, startCase, compact } from 'lodash';
import { addressCharacteristicType, addressTypes, deliveredReasons } from '.';

const findByType = (addressCharacteristicList, type) => {
  const findType = addressCharacteristicList && addressCharacteristicList.find(ac => ac.type === type);
  if (!findType) return null;

  return findType.is_selected;
}

const ContentQuestionnaire = ({ question, answer }) => {
  if (answer === null) return null;
  if (answer && Array.isArray(answer)) {
    answer = compact(answer);
    if(answer && answer.length < 1) return null;
  }

  return (
    <Box>
      <Box color={'#737273'} fontSize={'16px'} mb={0} mr={1}>
        {question}
      </Box>
      {typeof answer === 'boolean' 
        ? <Box fontWeight={600} marginLeft={2}>- { answer ? 'Yes' : 'No'}</Box>
        : Array.isArray(answer)
          ? answer.map((item, idx) => <Box fontWeight={600} marginLeft={2} key={idx}>- {item}</Box>)
          : <Box fontWeight={600} marginLeft={2}>- {answer}</Box>
      }
      
    </Box>
  )
}

function QuestionnaireDetail({ questionnaireInfo, shipment }) {
  const { recipient_questionnaire, access_codes, access_code_type } = questionnaireInfo;
  const {address_type, address_characteristic, delivery_reason} = recipient_questionnaire;

  if (!address_type) return null;

  const contentDeliveryReason = () => {
    if(!delivery_reason) return null;
    if (
      ([addressTypes.SINGLE_HOUSE].includes(address_type) && ![deliveredReasons.SECURITY, deliveredReasons.RECEPTION].includes(delivery_reason))
      || ([addressTypes.APARTMENT_COMPLEX, addressTypes.COMMERCIAL_BUILDING].includes(address_type) && ![deliveredReasons.SIDE_DOOR].includes(delivery_reason))
    ) {
      if (delivery_reason === deliveredReasons.OTHER) {
        return <span>{startCase(toLower(delivery_reason.replace(["_", "-"], " ")))} with note: {shipment.dropoff_note} </span>
      }
      return startCase(toLower(delivery_reason.replace(["_", "-"], " ")))
    }
    return null;
  }

  const contentAccessCode = () => {
    if(!access_code_type || !access_codes) return null;

    return Object.entries(access_codes).map(([key, value], idx) => {
      if(!value) return null;

      return (
        <Fragment>
          <span style={{color: '#737273', fontWeight: 400}}>{access_code_type[key]}:</span>
          <span>&nbsp;{value}</span>
        </Fragment>
      )}
    );
  }

  return (
    <Box fontFamily={'AvenirNext'} lineHeight={1.7}>
      {address_type && (
        <ContentQuestionnaire
          question={'What is your address type?'}
          answer={startCase(toLower(address_type.replace(["_", "-"], " ")))}
        />
      )}

      {[addressTypes.SINGLE_HOUSE].includes(address_type) && (
        <ContentQuestionnaire
          question={'Is your house gated?'}
          answer={findByType(address_characteristic, addressCharacteristicType.HOUSE_GATED)}
        />
      )}
      {[addressTypes.COMMERCIAL_BUILDING, addressTypes.APARTMENT_COMPLEX].includes(address_type) && (
        <Fragment>
          <ContentQuestionnaire
            question={'Is your apartment complex/commercial building gated?'}
            answer={findByType(address_characteristic, addressCharacteristicType.GATED)}
          />

          <ContentQuestionnaire
            question={'Is your apartment complex/commercial building a high-rise?'}
            answer={findByType(address_characteristic, addressCharacteristicType.HIGH_RISE)}
          />
        </Fragment>
      )}

      {delivery_reason && (
        <ContentQuestionnaire
          question={'Where do you want your package to be delivered?'}
          answer={contentDeliveryReason()}
        />
      )}

      {access_codes && (
        <ContentQuestionnaire
          question={'Access code'}
          answer={contentAccessCode()}
        />
      )}
    </Box>
  )
}

export default QuestionnaireDetail