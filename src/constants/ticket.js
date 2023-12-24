export const NEGATIVE_REASON_CODES = ['OTD', 'Late', 'Invalid Driver ID'];

export const POSITIVE_REASON_CODES = ['Not enough routes', 'Tech issue'];

export const REASON_CODES = [...POSITIVE_REASON_CODES, ...NEGATIVE_REASON_CODES];

export const DEFAULT_DIRECT_BOOKING_COMMUNICATION_TEMPLATE = 'Hi ${first_name},\n\n' + 'https://schedule.axlehire.com/m/${code} \n\n' + 'Please click the link for booking. \n' + 'Please feel free to reach out to Our Dispatch team at 1-855-249-7447, if you have any questions. Thank you.\n' + '\n' + 'AxleHire has ${num_of_route} routes available for tomorrow. \n' + 'Delivery window time: 08:00AM - 07:00PM. \n' + 'Please show up at the pick address by 6:00AM.';
