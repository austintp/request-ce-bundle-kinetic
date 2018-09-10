import React from 'react';
import { connect } from 'react-redux';
import { compose, lifecycle, withState } from 'recompose';
import { Utils, PageTitle } from 'common';
import { actions } from '../../../redux/modules/settingsSetup';
import StepWizard from 'react-step-wizard';
import { Step1 } from './Step1';

export const WizardContainer = ({
  packageVersion,
  configuredPackageVersion,
}) => (
  <div className="package-layout">
    <div className="page-container page-container--settings-setup">
      <PageTitle parts={['Setup Wizard']} />
      <div className="page-panel page-panel--settings-setup">
        <div className="container">
          <h3 className="text-center">Setup Wizard</h3>
          <div>
            <p>Confiugred Package Version: {configuredPackageVersion}</p>
            <p>Running Package Version: {packageVersion}</p>
          </div>
          <div className="jumbotron">
            <StepWizard>
              <Step1 />
              <Step1 />
              <Step1 />
            </StepWizard>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const mapStateToProps = state => ({
  packageVersion: state.space.settingsSetup.packageVersion,
  configuredPackageVersion: state.space.settingsSetup.configuredPackageVersion,
});

const mapDispatchToProps = {};

export const Wizard = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  // withState('inputs', 'setInputs', props => ({
  //   'Approval Days Due': Utils.getAttributeValue(
  //     props.space,
  //     'Approval Days Due',
  //   ),
  //   'Service Days Due': Utils.getAttributeValue(
  //     props.space,
  //     'Service Days Due',
  //   ),
  //   'Task Days Due': Utils.getAttributeValue(props.space, 'Task Days Due'),
  //   'Task Assignee Team': Utils.getAttributeValue(
  //     props.space,
  //     'Task Assignee Team',
  //   ),
  //   'Approval Form Slug': Utils.getAttributeValue(props, 'Approval Form Slug'),
  //   'Feedback Form Slug': Utils.getAttributeValue(
  //     props.space,
  //     'Feedback Form Slug',
  //   ),
  //   'Help Form Slug': Utils.getAttributeValue(props.space, 'Help Form Slug'),
  //   'Request Alert Form Slug': Utils.getAttributeValue(
  //     props.space,
  //     'Request Alert Form Slug',
  //   ),
  //   'Suggest a Service Form Slug': Utils.getAttributeValue(
  //     props.space,
  //     'Suggest a Service Form Slug',
  //   ),
  //   'Task Form Slug': Utils.getAttributeValue(props.space, 'Task Form Slug'),
  // })),
  lifecycle({
    componentWillMount() {
      // this.props.fetchSpaceSettings();
      // this.props.fetchSpaceSettingsTeams();
    },
  }),
)(WizardContainer);
