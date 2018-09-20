import { Record, List } from 'immutable';
import { Utils } from 'common';
const { namespace, noPayload, withPayload } = Utils;

export const types = {
  VALIDATE_SETUP: namespace('settingsSetup', 'VALIDATE_SETUP'),
  SET_SETUP_INFO: namespace('settingsSetup', 'SET_SETUP_INFO'),
  CREATE_ATTR_DEFS: namespace('settingsSetup', 'CREATE_ATTR_DEFS'),
  SET_STEP_COMPLETE: namespace('settingsSetup', 'SET_STEP_COMPLETE'),
  SET_STEP_LOADING: namespace('settingsSetup', 'SET_STEP_LOADING'),
  SET_STEP_ERROR: namespace('settingsSetup', 'SET_STEP_ERROR'),
  SET_STEP_TOTAL_PROGRESS: namespace(
    'settingsSetup',
    'SET_STEP_TOTAL_PROGRESS',
  ),
  SET_STEP_CURRENT_PROGRESS: namespace(
    'settingsSetup',
    'SET_STEP_CURRENT_PROGRESS',
  ),
  SET_STEP_ACTION: namespace('settingsSetup', 'SET_STEP_ACTION'),
};

export const actions = {
  validateSetup: noPayload(types.VALIDATE_SETUP),
  setSetupInfo: withPayload(types.SET_SETUP_INFO),
  createAttrDefs: withPayload(types.CREATE_ATTR_DEFS),
  setStepLoading: (step, loading) => ({
    type: types.SET_STEP_LOADING,
    payload: { step, loading },
  }),
  setStepComplete: (step, complete) => ({
    type: types.SET_STEP_COMPLETE,
    payload: { step, complete },
  }),
  setStepError: (step, error) => ({
    type: types.SET_STEP_ERROR,
    payload: { step, error },
  }),
  setStepTotalProgress: (step, total) => ({
    type: types.SET_STEP_TOTAL_PROGRESS,
    payload: { step, total },
  }),
  setStepCurrentProgress: (step, current) => ({
    type: types.SET_STEP_CURRENT_PROGRESS,
    payload: { step, current },
  }),
  setStepAction: (step, action) => ({
    type: types.SET_STEP_ACTION,
    payload: { step, action },
  }),
};

const Meta = Record({
  loading: false,
  complete: false,
  errors: List(),
  actions: List(),
  totalProgress: 1,
  currentProgress: 0,
});

export const State = Record({
  setupRequired: false,
  packageVersion: '',
  configuredPackageVersion: '',
  meta: Record(),
});

export const reducer = (state = State(), { type, payload }) => {
  switch (type) {
    case types.SET_SETUP_INFO:
      return state
        .set('setupRequired', payload.setupRequired)
        .set('packageVersion', payload.packageVersion)
        .set('configuredPackageVersion', payload.configuredPackageVersion);
    case types.CREATE_ATTR_DEFS:
      return state
        .setIn(['meta'], { attributeDefinitions: Meta() })
        .setIn(['meta', 'attributeDefinitions', 'loading'], true);
    case types.SET_STEP_LOADING:
      return state.setIn(['meta', payload.step, 'loading'], payload.value);
    case types.SET_STEP_ERROR:
      return state.updateIn(['meta', payload.step, 'errors'], errors =>
        errors.push(payload.value),
      );
    case types.SET_STEP_TOTAL_PROGRESS:
      return state.setIn(
        ['meta', payload.step, 'totalProgress'],
        payload.total,
      );
    case types.SET_STEP_CURRENT_PROGRESS:
      return state.setIn(
        ['meta', payload.step, 'currentProgress'],
        payload.current,
      );
    case types.SET_STEP_ACTION:
      return state.updateIn(['meta', payload.step, 'actions'], actions =>
        actions.push(payload.action),
      );
    case types.SET_STEP_COMPLETE:
      return state.setIn(['meta', payload.step, 'complete'], payload.complete);
    default:
      return state;
  }
};
