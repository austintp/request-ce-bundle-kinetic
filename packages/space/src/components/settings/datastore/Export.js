import React, { Fragment } from 'react';
import { compose, withHandlers, withState, lifecycle } from 'recompose';
import downloadjs from 'downloadjs';

import { connect } from 'react-redux';
import papaparse from 'papaparse';

import { actions } from '../../../redux/modules/settingsDatastore';

const ExportComponent = ({
  submissions,
  exportStatus,
  submissionsCount,
  handleDownload,
  form,
}) => (
  <Fragment>
    {exportStatus === 'NOT_STARTED' ? (
      <button className="btn btn-info" onClick={handleDownload}>
        {1 === 2 ? (
          <span>Export Records for Query</span>
        ) : (
          <span>Export All Records</span>
        )}
      </button>
    ) : (
      <Fragment>
        <p>{submissionsCount} Records retrieved</p>
        {/* TODO: Warp user feedback in a conditional if exportStatus === Failed */}
        {exportStatus === 'CONVERT' && <p>Converting Records to CSV format</p>}
        {exportStatus === 'DOWNLOAD' && (
          <p>{`Downloading ${submissionsCount} Records to ${form.name}.csv`}</p>
        )}
        {exportStatus === 'COMPLETE' && (
          <Fragment>
            <p>
              {`${submissionsCount} Records exported to ${form.name}.csv.  `}
            </p>
            <p>Click Cancel to close the modal</p>
          </Fragment>
        )}
      </Fragment>
    )}
  </Fragment>
);

function createCSV(submissions, form) {
  // Create csv string that will be used for download
  return papaparse.unparse(
    submissions.reduce((acc, submission) => {
      let submissionValues = submission.values;
      /** Because of the parser use the fields currently on the form to build the csv string.
       * This will exclude fields (from the csv) that existed on the form but have been removed.
       */
      form.get('fields').forEach(field => {
        // If older submissions don't have a new field then add it with a value of null.
        if (submissionValues.hasOwnProperty(field.name)) {
          // Checkbox Array values must be stringifyed to retain their array brackets.
          if (Array.isArray(submissionValues[field.name])) {
            submissionValues[field.name] = JSON.stringify(
              submissionValues[field.name],
            );
          }
        } else {
          submissionValues[field.name] = null;
        }
        return null;
      });
      acc.push({
        'DataStore Record ID': submission.id,
        ...submissionValues,
      });
      return acc;
    }, []),
  );
}

const handleDownload = props => () => {
  props.fetchAllSubmissions({ formSlug: props.form.slug, accumulator: [] });
  props.setExportStatus('FETCHING_RECORDS');
};

const mapStateToProps = state => ({
  form: state.space.settingsDatastore.currentForm,
  submissions: state.space.settingsDatastore.exportSubmissions,
  submissionsCount: state.space.settingsDatastore.exportCount,
});

const mapDispatchToProps = {
  fetchAllSubmissions: actions.fetchAllSubmissions,
  setExportSubmissions: actions.setExportSubmissions,
};

export const Export = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withState('exportStatus', 'setExportStatus', 'NOT_STARTED'),
  withHandlers({
    handleDownload,
  }),
  lifecycle({
    componentWillReceiveProps(nextProps) {
      if (this.props.submissions.length !== nextProps.submissions.length) {
        nextProps.setExportStatus('CONVERT');
        const csv = createCSV(nextProps.submissions, nextProps.form);
        // TODO: If CSV fails setExportStatus to FAILD
        nextProps.setExportStatus('DOWNLOAD');
        downloadjs(csv, nextProps.form.name + '.csv', 'text/csv');
        nextProps.setExportStatus('COMPLETE');
      }
    },
    componentWillUnmount() {
      this.props.setExportSubmissions([]);
    },
  }),
)(ExportComponent);
