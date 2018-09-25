import React, { Fragment } from 'react';

import { compose, lifecycle, withState, withHandlers } from 'recompose';
import { connect } from 'react-redux';
import { CoreAPI } from 'react-kinetic-core';
import { Modal, ModalBody, ModalFooter } from 'reactstrap';
import StepWizard from 'react-step-wizard';
import { Utils, PageTitle } from 'common';

import { actions } from '../../../redux/modules/settingsSetup';
import { version as packageVersion } from '../../../../package.json';
import { Overview } from './1_Overview';
import { EvaluateMissing } from './2_EvaluateMissing';

const validatePackageVersion = async ({
  setSetupCompleted,
  setSetupRequired,
  setConfiguredPackageVersion,
  kappSlug,
  setSetupObject,
}) => {
  // Fetch the Space to determine Bundle Package Version
  (await kappSlug)
    ? CoreAPI.fetchKapp({ kappSlug, include: 'attributesMap' })
    : CoreAPI.fetchSpace({
        include: 'attributes',
      }).then(data => {
        // Determine if Wizard interacting with Space or Kapp
        const setupObject = kappSlug === null ? data.space : data.kapp;
        // Get the configured package version of the Space or Kapp
        const configuredPackageVersion = Utils.getAttributeValue(
          setupObject,
          'Bundle Package Version',
          null,
        );
        // Set the Bundle Package Version into Component State
        setConfiguredPackageVersion(configuredPackageVersion);
        // Set the Space Export into Component State
        setSetupObject(setupObject);
        // Determine if Setup is Required
        const needsSetup = configuredPackageVersion !== packageVersion;
        // If Setup Required, set setup required, otherwise dispatch setupCompleted and store in redux
        needsSetup ? setSetupRequired(needsSetup) : setSetupCompleted(true);
      });
};

export const WizardComponent = ({
  packageVersion,
  configuredPackageVersion,
  isOpen,
  children,
  setupRequired,
  setupCompleted,
  setupObject,
  setSetupObject,
  kappSlug,
}) => (
  <Fragment>
    {!setupCompleted ? (
      <Modal isOpen={isOpen} size="lg">
        <PageTitle parts={['Setup Wizard']} />
        <div className="modal-header">
          <h4 className="modal-title">
            <span>Setup Wizard</span>
          </h4>
        </div>
        <ModalBody>
          <StepWizard>
            <Overview
              configuredPackageVersion={configuredPackageVersion}
              packageVersion={packageVersion}
              setSetupObject={setSetupObject}
              setupObject={setupObject}
              kappSlug={kappSlug}
            />
            <EvaluateMissing />
          </StepWizard>
        </ModalBody>
        <ModalFooter />
      </Modal>
    ) : (
      children
    )}
  </Fragment>
);

const mapStateToProps = state => ({
  kappSlug: state.app.config.kappSlug,
  //packageVersion: state.space.settingsSetup.packageVersion,
  //configuredPackageVersion: state.space.settingsSetup.configuredPackageVersion,
});

const mapDispatchToProps = {
  validateSetup: actions.validateSetup,
};

export const Wizard = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withState('setupRequired', 'setSetupRequired', true),
  withState('packageVersion', 'setPackageVersion', packageVersion),
  withState('configuredPackageVersion', 'setConfiguredPackageVersion', null),
  withState('setupObject', 'setSetupObject', {
    name: '',
    slug: '',
  }),
  withState('isOpen', 'setIsOpen', true),
  lifecycle({
    componentWillMount() {
      validatePackageVersion(this.props);
      //this.props.validateSetup();
      // this.props.fetchSpaceSettingsTeams();
    },
  }),
)(WizardComponent);
