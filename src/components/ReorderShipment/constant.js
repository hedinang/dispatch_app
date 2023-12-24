const STATUS_COLOR_CODE = {
  PENDING: "#fa6725",
  IN_PROGRESS: "#fdbd39",
  COMPLETED: "#4abc4e",
  SUCCEEDED: "#4abc4e",
  FAILED: "#d63031",
  LATE: "#8447f6",
  EARLY: "#a5ccec",
};

export default {
  statuses: {
    PENDING: {
      borderRightColor: STATUS_COLOR_CODE.PENDING,
    },
    IN_PROGRESS: {
      borderRightColor: STATUS_COLOR_CODE.IN_PROGRESS,
    },
    SUCCEEDED: {
      borderRightColor: STATUS_COLOR_CODE.SUCCEEDED,
    },
    FAILED: {
      borderRightColor: STATUS_COLOR_CODE.FAILED,
    },
    DROP_OFF: {
      PENDING: {
        borderRightColor: STATUS_COLOR_CODE.PENDING,
      },
      IN_PROGRESS: {
        borderRightColor: STATUS_COLOR_CODE.IN_PROGRESS,
      },
      SUCCEEDED: {
        borderRightColor: STATUS_COLOR_CODE.SUCCEEDED,
      },
      FAILED: {
        borderRightColor: STATUS_COLOR_CODE.FAILED,
      },
      DISCARDED: {
        borderRightColor: "#aaa",
      },
    },
    RETURN: {
      PENDING: {
        borderRightColor: "#96979a",
      },
      IN_PROGRESS: {
        borderRightColor: "#96979a",
      },
      SUCCEEDED: {
        borderRightColor: "#297ec8",
      },
      FAILED: {
        borderRightColor: "#222",
      },
      DISCARDED: {
        borderRightColor: "#aaa",
      },
    },
  },
};
