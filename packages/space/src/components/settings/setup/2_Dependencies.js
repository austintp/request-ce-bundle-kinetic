import React from 'react';
import { connect } from 'react-redux';
import { compose, lifecycle, withHandlers, withState } from 'recompose';
import { PageTitle } from 'common';
import { actions } from '../../../redux/modules/settingsSetup';
import { Record, List } from 'immutable';
import { CoreAPI } from 'react-kinetic-core';

const DependenciesToImport = List([
  {
    includeKey: 'spaceAttributeDefinitions',
    type: 'attributeDefinitions',
    name: 'Space Attribute Definitions',
    complete: false,
  },
  {
    includeKey: 'teamAttributeDefinitions',
    type: 'attributeDefinitions',
    name: 'Team Attribute Definitions',
    complete: false,
  },
  {
    includeKey: 'userAttributeDefinitions',
    type: 'attributeDefinitions',
    name: 'User Attribute Definitions',
    complete: false,
  },
  {
    includeKey: 'userProfileAttributeDefinitions',
    type: 'attributeDefinitions',
    name: 'User Profile Attribute Definitions',
    complete: false,
  },
  {
    includeKey: 'datastoreFormAttributeDefinitions',
    type: 'attributeDefinitions',
    name: 'Datastore Attribute Definitions',
    complete: false,
  },
  {
    includeKey: 'securityPolicyDefinitions',
    type: 'securityPolicyDefinitions',
    name: 'Security Policy Definitions',
    complete: false,
  },
  {
    includeKey: 'webhooks',
    type: 'webhook',
    name: 'Webhooks',
    complete: false,
  },
  {
    includeKey: 'bridges',
    type: 'bridges',
    name: 'Bridges',
    complete: false,
  },
]);

const AttributeDefns = Record(
  DependenciesToImport.filter(d => d.type === 'attributeDefinitions').reduce(
    (aDfns, { includeKey }) => ({ ...aDfns, [includeKey]: List() }),
    {},
  ),
);

const installDependencies = async ({ updateActions }) => {
  const spaceIncludes = DependenciesToImport.map(d => d.includeKey).join(',');
  const attributeTypes = DependenciesToImport.filter(
    d => d.type === 'attributeDefinitions',
  ).map(d => d.includeKey);

  const [
    spaceAttributeDefinitions,
    teamAttributeDefinitions,
    userAttributeDefinitions,
    userProfileAttributeDefinitions,
    datastoreFormAttributeDefinitions,
    webhooks,
    { space },
  ] = await Promise.all([
    import('./data/spaceAttributeDefinitions.json'),
    import('./data/teamAttributeDefinitions.json'),
    import('./data/userAttributeDefinitions.json'),
    import('./data/userProfileAttributeDefinitions.json'),
    import('./data/datastoreFormAttributeDefinitions.json'),
    import('./data/webhooks.json'),
    CoreAPI.fetchSpace({ include: spaceIncludes }),
  ]);

  // Build up list of Required Attribute Definitions
  const requiredAttributeDefinitions = AttributeDefns({
    spaceAttributeDefinitions: List(spaceAttributeDefinitions),
    teamAttributeDefinitions: List(teamAttributeDefinitions),
    userAttributeDefinitions: List(userAttributeDefinitions),
    userProfileAttributeDefinitions: List(userProfileAttributeDefinitions),
    datastoreFormAttributeDefinitions: List(datastoreFormAttributeDefinitions),
  });

  // Build up list of Current Attribute Definitions
  const currentAttributeDefinitions = AttributeDefns({
    spaceAttributeDefinitions: List(space.spaceAttributeDefinitions),
    teamAttributeDefinitions: List(space.teamAttributeDefinitions),
    userAttributeDefinitions: List(space.userAttributeDefinitions),
    userProfileAttributeDefinitions: List(
      space.userProfileAttributeDefinitions,
    ),
    datastoreFormAttributeDefinitions: List(
      space.datastoreFormAttributeDefinitions,
    ),
  });

  // Build up list of Delta Attribute Definitions
  const attributeDefinitionUpdates = attributeTypes.reduce(
    (difference, type) =>
      difference.update(type, attrs =>
        attrs.filterNot(attr =>
          currentAttributeDefinitions[type].find(
            a =>
              a.name === attr.name && a.allowsMultiple === attr.allowsMultiple,
          ),
        ),
      ),
    requiredAttributeDefinitions,
  );

  // Loop over Each Attribute Type
  // If no attribute definitions need to be made for the type, complete it
  // Otherwise create the attribute definitions that are needed.
  Object.entries(attributeDefinitionUpdates.toJS()).forEach(
    ([type, attributes]) => {
      if (attributes.length > 0) {
        Promise.all(
          attributes.map(attr =>
            CoreAPI.createAttributeDefinition({
              attributeType: type,
              attributeDefinition: attr,
            }).then(data => console.log(type, data)),
          ),
        ).then(() => {
          updateActions(type, true);
          console.log(`Completed Processing ${type}`);
        });
      } else {
        updateActions(type, true);
      }
    },
  );
};

export const DependenciesComponent = props => (
  <div>
    <PageTitle parts={['Step 2', 'Imports']} />
    <div>
      {props.actions.map(action => (
        <p key={action.includeKey}>
          {action.name}
          <span className="setup-action-status">
            {action.complete ? (
              <i className="setup-action-status__complete fa fa-check-circle-o" />
            ) : (
              <i className="fa fa-spinner fa-spin fa-fw" />
            )}
          </span>
        </p>
      ))}
    </div>
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

export const Dependencies = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withState('actions', 'setActions', DependenciesToImport),
  withHandlers({
    updateActions: props => (type, complete) => {
      props.setActions(
        props.actions.update(
          props.actions.findIndex(action => action.includeKey === type),
          updateType => ({ ...updateType, complete: complete }),
        ),
      );
    },
  }),

  lifecycle({
    componentWillMount() {},
    componentDidUpdate(prevProps) {
      if (this.props.isActive && this.props.isActive !== prevProps.isActive) {
        this.props.setActions(DependenciesToImport);
        installDependencies(this.props);
      }
    },
  }),
)(DependenciesComponent);
