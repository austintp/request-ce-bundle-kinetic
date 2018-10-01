import React, { Fragment } from 'react';
import { KappLink as Link, PageTitle } from 'common';
import { ServiceCard } from '../shared/ServiceCard';
import { ArticleCard } from '../shared/ArticleCard';

export const Category = ({ category, articles }) => (
  <Fragment>
    <PageTitle parts={[`Categories: ${category.name}`]} />
    <span className="services-color-bar services-color-bar__blue-slate" />
    <div className="page-container page-container--services-category">
      <div className="page-title">
        <div className="page-title__wrapper">
          <h3>
            <Link to="/">services</Link> /{' '}
            <Link to="/categories">categories</Link> /
          </h3>
          <h1>{category.name} Services</h1>
        </div>
      </div>
      <div className="cards__wrapper cards__wrapper--services">
        <div className="col">
          <h5>Services</h5>
          {category.forms
            .map(form => ({
              form,
              path: `/categories/${category.slug}/${form.slug}`,
              key: form.slug,
            }))
            .map(props => <ServiceCard {...props} />)}
        </div>
        {articles.size > 0 && (
          <div className="col">
            <h5>Featured Articles</h5>
            {articles.map(article => (
              <ArticleCard
                key={article.id}
                path={`/articles/${article.id}`}
                article={article}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  </Fragment>
);
