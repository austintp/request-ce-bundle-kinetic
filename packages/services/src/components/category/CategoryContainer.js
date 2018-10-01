import { connect } from 'react-redux';
import { lifecycle, compose, withState } from 'recompose';
import { Category } from './Category';
import { KnowledgeManagement } from 'common';

const mapStateToProps = (state, props) => ({
  category: state.services.categories.data
    .filter(category => category.slug === props.match.params.categorySlug)
    .first(),
});

export const CategoryContainer = compose(
  connect(mapStateToProps),
  withState('articles', 'setArticles', []),
  lifecycle({
    componentWillMount() {
      KnowledgeManagement.fetchKnowledgeArticles(
        `category::${this.props.category.slug}`,
        this.props.setArticles,
      );
    },
    componentWillReceiveProps(nextProps) {
      if (this.props.query !== nextProps.query) {
        KnowledgeManagement.fetchKnowledgeArticles(
          `category::${nextProps.category.slug}`,
          nextProps.setArticles,
        );
      }
    },
  }),
)(Category);
