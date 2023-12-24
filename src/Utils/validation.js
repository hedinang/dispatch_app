import * as Yup from 'yup';
import _ from 'lodash';

const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'];
const ssnRegex = /^(?!666|000|9\d{2})(?:\d|\*){3}-?(?!00)(?:\d|\*){2}-?(?!0{4})\d{4}$/;

export const lazyValidation = (field, value) => {
  switch (typeof value) {
    case 'object':
      return Yup.object().shape({
        label: Yup.string(),
        value: Yup.string()
      }).nullable().required(`${field} is required`);
    default:
      return Yup.string().required(`${field} is required`);
  }
}


export const validateImage = (isRequired, msgRequired, configFileSize) => {
  let yup = Yup.mixed().nullable();
  if (isRequired) {
    yup = yup
      .required(`${msgRequired} is required`)
      .test({
        message: 'Please provide a supported file type',
        test: (file) => {
          if(!file || (typeof file === 'string' && file)) return true;

          const isValid = SUPPORTED_FORMATS.includes(file && file.type);
          return isValid;
        }
      });
  }
  return yup
    .test({
      message: `File too big, can't exceed ${configFileSize}Mb`,
      test: (file) => {
        if(!file || (typeof file === 'string' && file)) return true;

        const isValid = file.size < configFileSize * 1024 * 1024;
        return isValid;
      }
    })
}

export const validateDate = (isRequired, msgRequired, fieldWhen, msgWhen, isMinDate) => {
  let yup = Yup.date().nullable().default(null);
  if (isRequired) {
    yup = yup.required(`${msgRequired} is required`);
  }
  return yup
    .when(fieldWhen,
      (dateParams, schema) => {
        const removeDateInValid = _.compact(dateParams);
        if(removeDateInValid && removeDateInValid.length > 0) {
          if (isMinDate)
            return schema.min(dateParams, msgWhen);
          return schema.max(dateParams, msgWhen)
        }
        return schema
      }
    )
}

export const validateSSN = () => {
  return Yup.string()
    .required('SSN is required')
    .matches(ssnRegex, 'SSN invalid')
}