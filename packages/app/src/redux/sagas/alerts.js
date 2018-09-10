import { takeEvery, call, put, select } from 'redux-saga/effects';
import { CoreAPI } from 'react-kinetic-core';
import { actions, types } from '../modules/alerts';
import { Utils } from 'common';

// Alerts Search Query
export const ALERTS_SEARCH = new CoreAPI.SubmissionSearch()
  .eq('values[Status]', 'Active')
  .include('details,values')
  .limit(1000)
  .build();

export const selectAlertsFormSlug = state =>
  state.app.space &&
  Utils.getAttributeValue(state.app.space, 'Alerts Form Slug', undefined);

export function* fetchAlertsTask() {
  const alertsFormSlug = yield select(state => selectAlertsFormSlug(state));
  if (alertsFormSlug) {
    const { submissions, serverError } = yield call(CoreAPI.searchSubmissions, {
      kapp: 'admin',
      form: alertsFormSlug,
      search: ALERTS_SEARCH,
    });

    yield put(
      serverError
        ? actions.setAlertsError(serverError)
        : actions.setAlerts(submissions),
    );
  }
}

export function* watchAlerts() {
  yield takeEvery(types.FETCH_ALERTS, fetchAlertsTask);
}
