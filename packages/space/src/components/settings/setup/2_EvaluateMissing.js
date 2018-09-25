import React from 'react';
import { connect } from 'react-redux';
import { compose, lifecycle, withHandlers, withState } from 'recompose';
import { Utils, PageTitle } from 'common';
import { actions } from '../../../redux/modules/settingsSetup';
import { Record, List, fromJS } from 'immutable';
import { CoreAPI } from 'react-kinetic-core';

const fetchRequirements = async ({ setRequirements }) => {
  await import('./data.json').then(data => {
    setRequirements(data);
  });
};

export const EvaluateMissingComponent = props => (
  <div>
    <PageTitle parts={['Step 1', 'Setup Wizard']} />
    {props.configuredPackageVersion === null ? (
      <div>
        <p className="text-center">
          It looks like you're installing this package for the first time. Let's
          get started by confirming some key information up front.
        </p>
      </div>
    ) : (
      <p className="text-center">Package Upgrade</p>
    )}
    <p className="text-center">
      Let's start by creating some of the foundation data needed to use this
      package
    </p>
    <p>{props.currentStep}</p>
    {props.requirements !== null && (
      <ul>
        {props.requirements.space.attributes.map(r => (
          <li key={r.name}>{r.name}</li>
        ))}
      </ul>
    )}
    <button className="btn btn-primary" onClick={props.previousStep}>
      Back
    </button>
    <button className="btn btn-primary" onClick={props.nextStep}>
      Continue
    </button>
  </div>
);

const mapStateToProps = state => ({
  stepMeta: state.space.settingsSetup.meta.attributeDefinitions,
});

const mapDispatchToProps = {
  createAttributeDefs: actions.createAttrDefs,
};

export const EvaluateMissing = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withHandlers({
    seedAttributeDefinitions: props => () => {
      return false;
    },
  }),
  withState('requirements', 'setRequirements', null),
  lifecycle({
    componentWillMount() {
      fetchRequirements(this.props);
    },
  }),
)(EvaluateMissingComponent);
