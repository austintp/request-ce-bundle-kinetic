import { takeEvery, put, all, call, select } from 'redux-saga/effects';
import { CoreAPI } from 'react-kinetic-core';
import { actions, types } from '../modules/settingsSetup';
import { actions as errorActions } from '../modules/errors';
import { Record, List } from 'immutable';
import { cancelSaveTeamSaga } from './team';

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

    // const attribueDefCalls = differences.map(type =>
    //   call(CoreAPI.searchSubmissions, {
    //     search: searchQuery.build(),
    //     datastore: true,
    //     form: form.slug,
    //   }),
    // );

    console.log(Object.keys(differences.toObject()));

    //    const calls = Object.keys(d)

    // const attributeCalls = Object.keys(differences).map(type =>
    //   call(CoreAPI.updateSpace(differences.toJS))
    // )

    //console.log(delta);

    // yield put(
    //   actions.setSetupInfo({
    //     setupRequired,
    //     packageVersion,
    //     configuredPackageVersion,
    //   }),
    // );
  }
}

export function* watchSettingsSetup() {
  yield takeEvery(types.VALIDATE_SETUP, validateSetupSaga);
  yield takeEvery(types.CREATE_ATTR_DEFS, createAttrDefsSaga);
}
