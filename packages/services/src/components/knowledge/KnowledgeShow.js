import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { lifecycle, compose, withState, withHandlers } from 'recompose';
import ReactMarkdown from 'react-markdown';
import { KappLink as Link, PageTitle, Icon, KnowledgeManagement } from 'common';

const KnowledgeShowComponent = ({ article, search, helpful, notHelpful }) => (
  <Fragment>
    <PageTitle parts={[article && `#${article.label}`, 'Articles']} />
    <span className="services-color-bar services-color-bar__blue-slate" />
    <Link className="nav-return" to={`/search/${search.term}`}>
      <span className="fa fa-fw fa-chevron-left" />
      Search Results {search.term ? `for '${search.term}'` : ''}
    </Link>
    {article && (
      <div className="page-container page-container--submission">
        <div className="page-content">
          <div className="submission-title">
            <h1>
              <Icon image="fa-file-text" background="greenGrass" />
              {article.label}
            </h1>
          </div>
          <ReactMarkdown
            escapeHtml={false}
            source={article.values['Content']}
          />
        </div>
        <hr />
        <h4>
          Was this article helpful?{'  '}
          <span>
            <button onClick={helpful} className="btn btn-success">
              <i className="fa fa-thumbs-up" /> Yes
            </button>{' '}
            <button onClick={notHelpful} className="btn btn-danger">
              <i className="fa fa-thumbs-down" /> No
            </button>
          </span>
        </h4>
      </div>
    )}
  </Fragment>
);

const helpful = ({ articleId }) => () =>
  alert(`Article ${articleId} was HELPUFL`);
const notHelpful = ({ articleId }) => () =>
  alert(`Article ${articleId} was NOT HELPUFL`);

const mapStateToProps = (state, props) => {
  return {
    search: { term: props.match.params.query || '' },
    articleId: props.match.params.id,
  };
};

export const KnowledgeShow = compose(
  connect(mapStateToProps),
  withState('article', 'setArticle', null),
  withHandlers({ helpful, notHelpful }),
  lifecycle({
    componentWillMount() {
      KnowledgeManagement.fetchKnowledgeArticle(
        this.props.articleId,
        this.props.setArticle,
      );
    },
    componentWillReceiveProps(nextProps) {
      if (this.props.articleId !== nextProps.articleId) {
        KnowledgeManagement.fetchKnowledgeArticle(
          this.props.articleId,
          nextProps.setArticle,
        );
      }
    },
  }),
)(KnowledgeShowComponent);
