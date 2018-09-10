import React from 'react';
import { connect } from 'react-redux';
import { compose, lifecycle, withHandlers } from 'recompose';
import { Utils, PageTitle } from 'common';
import { actions } from '../../../redux/modules/settingsSetup';

export const Step1Component = props => (
  <div>
    {console.log(props)}
    <PageTitle parts={['Step 1', 'Setup Wizard']} />
    <h1 className="text-center">Lets get started by adding the fundamentals</h1>
    <p>{props.currentStep}</p>
    <button
      className="btn btn-primary btn-block"
      onClick={props.createAttributeDefs}
    >
      Continue
    </button>
  </div>
);

const mapStateToProps = state => ({
  packageVersion: state.space.settingsSetup.packageVersion,
  configuredPackageVersion: state.space.settingsSetup.configuredPackageVersion,
});

const mapDispatchToProps = {
  createAttributeDefs: actions.createAttrDefs,
};

export const Step1 = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withHandlers({
    seedAttributeDefinitions: props => () => {
      return false;
    },
  }),
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
)(Step1Component);
