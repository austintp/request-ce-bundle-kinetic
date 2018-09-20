import React from 'react';
import { connect } from 'react-redux';
import { compose, lifecycle, withHandlers, withState } from 'recompose';
import { Utils, PageTitle } from 'common';
import { actions } from '../../../redux/modules/settingsSetup';
import { Record, List, fromJS } from 'immutable';
import { CoreAPI } from 'react-kinetic-core';

const fetchAttributeDefintionFiles = async () => {
  return await Promise.all([
    import('./data/spaceAttributeDefinitions.json'),
    import('./data/teamAttributeDefinitions.json'),
    import('./data/userAttributeDefinitions.json'),
    import('./data/userProfileAttributeDefinitions.json'),
    import('./data/datastoreFormAttributeDefinitions.json'),
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

export const Step1Component = props => (
  <div>
    <PageTitle parts={['Step 1', 'Setup Wizard']} />
    <h1 className="text-center">Lets get started by adding the fundamentals</h1>
    <p>{props.currentStep}</p>
    {props.stepMeta && (
      <ul>
        {props.stepMeta.actions.map((action, key) => (
          <li key={key}>{action}</li>
        ))}
      </ul>
    )}
    {console.log(props.attributeDefinitions)}
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
  stepMeta: state.space.settingsSetup.meta.attributeDefinitions,
});

const mapDispatchToProps = {
  createAttributeDefs: actions.createAttrDefs,
};

const getAttrs = () => {
  const test = fetchAttributeDefintionFiles();
  console.log(test);
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
  withState('attributeDefinitions', 'setAttributeDefinitions', getAttrs()),
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
