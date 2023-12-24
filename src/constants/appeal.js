import colors from "../themes/colors";

export const APPEAL_STATUS = {
  'CREATED': 'CREATED',
  'APPROVED': 'APPROVED',
  'IN_PROGRESS': 'IN_PROGRESS',
  'REJECTED': 'REJECTED',
};

export const APPEAL_STATUS_MAP_TO_COLORS = {
  'CREATED': colors.graySeventh,
  'APPROVED': colors.periwinkle,
  'IN_PROGRESS': colors.greenThird,
  'REJECTED': colors.scarlet,
}
