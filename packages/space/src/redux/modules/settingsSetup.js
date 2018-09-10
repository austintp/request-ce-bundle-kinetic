import { Record } from 'immutable';
import { Utils } from 'common';
const { namespace, noPayload, withPayload } = Utils;

export const types = {
  VALIDATE_SETUP: namespace('space', 'VALIDATE_SETUP'),
  SET_SETUP_INFO: namespace('space', 'SET_SETUP_INFO'),
  CREATE_ATTR_DEFS: namespace('space', 'CREATE_ATTR_DEFS'),
};

export const actions = {
  validateSetup: noPayload(types.VALIDATE_SETUP),
  setSetupInfo: withPayload(types.SET_SETUP_INFO),
  createAttrDefs: withPayload(types.CREATE_ATTR_DEFS),
};

export const State = Record({
  setupRequired: false,
  packageVersion: '',
  configuredPackageVersion: '',
});

export const reducer = (state = State(), { type, payload }) => {
  switch (type) {
    case types.SET_SETUP_INFO:
      return state
        .set('setupRequired', payload.setupRequired)
        .set('packageVersion', payload.packageVersion)
        .set('configuredPackageVersion', payload.configuredPackageVersion);
    default:
      return state;
  }
};
