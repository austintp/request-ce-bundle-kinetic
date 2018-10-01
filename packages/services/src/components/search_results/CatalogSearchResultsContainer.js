import { connect } from 'react-redux';
import { CatalogSearchResults } from './CatalogSearchResults';
import { displayableFormPredicate } from '../../utils';
import { lifecycle, compose, withState } from 'recompose';
import { KnowledgeManagement } from 'common';

const matches = (form, term) =>
  form.name.toLowerCase().includes(term.toLowerCase()) ||
  (form.description &&
    form.description.toLowerCase().includes(term.toLowerCase()));

const mapStateToProps = (state, props) => {
  const query = props.match.params.query || '';
  return {
    query,
    forms: state.services.forms.data
      .filter(displayableFormPredicate)
      .filter(form => matches(form, query)),
  };
};

export const CatalogSearchResultsContainer = compose(
  connect(mapStateToProps),
  withState('articles', 'setArticles', []),
  // withHandlers({ setKnowledgeArticles }),
  lifecycle({
    componentWillMount() {
      KnowledgeManagement.fetchKnowledgeArticles(
        this.props.query,
        this.props.setArticles,
      );
    },
    componentWillReceiveProps(nextProps) {
      if (this.props.query !== nextProps.query) {
        KnowledgeManagement.fetchKnowledgeArticles(
          nextProps.query,
          nextProps.setArticles,
        );
      }
    },
  }),
)(CatalogSearchResults);
