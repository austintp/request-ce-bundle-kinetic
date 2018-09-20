import { takeEvery, put, all, call, select, fork } from 'redux-saga/effects';
import { CoreAPI } from 'react-kinetic-core';
import { actions, types } from '../modules/settingsSetup';
import { actions as errorActions } from '../modules/errors';
import { Record, List, fromJS } from 'immutable';

export function* validateSetupSaga() {
  const { space, spaceServerError } = yield call(CoreAPI.fetchSpace, {
    include: 'attributes',
  });

  if (spaceServerError) {
    yield put(errorActions.setSystemError(spaceServerError));
  } else {
    const packageVersion = yield select(
      state => state.app.config.packageVersion,
    );
    const configuredPackageVersion =
      space.attributes['Bundle Package Version'] &&
      space.attributes['Bundle Package Version'][0];

    const setupRequired = packageVersion !== configuredPackageVersion;
    yield put(
      actions.setSetupInfo({
        setupRequired,
        packageVersion,
        configuredPackageVersion,
      }),
    );
  }
}

const fetchAttributeDefintionFiles = () => {
  return Promise.all([
    import('../../components/settings/setup/data/spaceAttributeDefinitions.json'),
    import('../../components/settings/setup/data/teamAttributeDefinitions.json'),
    import('../../components/settings/setup/data/userAttributeDefinitions.json'),
    import('../../components/settings/setup/data/userProfileAttributeDefinitions.json'),
    import('../../components/settings/setup/data/datastoreFormAttributeDefinitions.json'),
  ]).then(attributeDefs => {
    return AttributeDefns({
      spaceAttributeDefinitions: List(attributeDefs[0]),
      teamAttributeDefinitions: List(attributeDefs[1]),
      userAttributeDefinitions: List(attributeDefs[2]),
      userProfileAttributeDefinitions: List(attributeDefs[3]),
      datastoreFormAttributeDefinitions: List(attributeDefs[4]),
    });
  });
};

const AttributeDefns = Record({
  spaceAttributeDefinitions: List(),
  teamAttributeDefinitions: List(),
  userAttributeDefinitions: List(),
  userProfileAttributeDefinitions: List(),
  datastoreFormAttributeDefinitions: List(),
});

const attributeTypes = [
  'spaceAttributeDefinitions',
  'teamAttributeDefinitions',
  'userAttributeDefinitions',
  'userProfileAttributeDefinitions',
  'datastoreFormAttributeDefinitions',
];

const selectCurrentProgress = state =>
  state.space.settingsSetup.meta.attributeDefinitions.currentProgress;

// Helpers
function* requestAndPut(requestParameters) {
  const { attributeDefinition, error, serverError } = yield call(
    ...requestParameters,
  );

  if (error || serverError) {
    yield put(
      actions.setStepError('attributeDefinitions', error || serverError),
    );
  } else {
    const currentProgress = yield select(selectCurrentProgress);
    yield put(
      actions.setStepCurrentProgress(
        'attributeDefinitions',
        currentProgress + 1,
      ),
    );
    yield put(
      actions.setStepAction(
        'attributeDefinitions',
        `Created Attribute Definition: ${attributeDefinition.name}`,
      ),
    );
  }
}

export function* createAttrDefsSaga(action) {
  const requiredAttributeDefinitions = yield call(fetchAttributeDefintionFiles);
  const { space, spaceServerError } = yield call(CoreAPI.fetchSpace, {
    include: attributeTypes.join(','),
  });
  if (spaceServerError) {
    yield put(errorActions.setSystemError(spaceServerError));
  } else {
    const currentAttributeDefintions = Object.keys(space)
      .filter(k => k.includes('AttributeDefinitions'))
      .reduce((acc, k) => acc.set(k, List(space[k])), AttributeDefns());

    const differences = attributeTypes.reduce(
      (difference, type) =>
        difference.update(type, attrs =>
          attrs.filterNot(attr =>
            currentAttributeDefintions[type].find(
              a =>
                a.name === attr.name &&
                a.allowsMultiple === attr.allowsMultiple,
            ),
          ),
        ),
      requiredAttributeDefinitions,
    );

    const differenceCalls = Object.entries(differences.toJS())
      .filter(([type, attributes]) => !!attributes.length)
      .map(([type, attributes]) =>
        attributes.map(attr =>
          call(requestAndPut, [
            CoreAPI.createAttributeDefinition,
            {
              attributeType: type,
              attributeDefinition: attr,
            },
          ]),
        ),
      )
      .reduce((acc, val) => acc.concat(val), []);
    yield put(
      actions.setStepTotalProgress(
        'attributeDefinitions',
        differenceCalls.length,
      ),
    );
    yield all(differenceCalls);
    yield put(actions.setStepC);
  }
}

export function* watchSettingsSetup() {
  yield takeEvery(types.VALIDATE_SETUP, validateSetupSaga);
  yield takeEvery(types.CREATE_ATTR_DEFS, createAttrDefsSaga);
}
