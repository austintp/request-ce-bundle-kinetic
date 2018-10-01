import React from 'react';
import { KappLink as Link, Icon } from 'common';
import ReactMarkdown from 'react-markdown';

export const ArticleCard = ({ path, article }) => (
  <Link to={path} className="card card--service">
    <h1>
      <Icon image="fa-file-text" background="blueSlate" />
      {article.label}
    </h1>
    <ReactMarkdown
      className="article-markdown"
      allowedTypes={['paragraph']}
      escapeHtml={false}
      source={article.values['Content']}
    />
  </Link>
);
