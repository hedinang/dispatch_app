import _ from 'lodash';

export const compareData = (type, originalData, newData) => {
    switch (type) {
        case 'array':
            return _(originalData).xorWith(newData, _.isEqual).isEmpty();
        case 'object':
        case 'string':
            return _.isEqual(originalData, newData);
    }
}