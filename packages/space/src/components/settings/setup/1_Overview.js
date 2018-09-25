import React from 'react';
import { PageTitle } from 'common';

export const Overview = props => (
  <div>
    <PageTitle
      parts={[`Step ${props.currentStep}`, 'Overview', 'Setup Wizard']}
    />
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
    <button className="btn btn-primary" onClick={props.nextStep}>
      Continue
    </button>
  </div>
);
