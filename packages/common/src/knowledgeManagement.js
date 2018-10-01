import { CoreAPI } from 'react-kinetic-core';
import stopword from 'stopword';
import { List } from 'immutable';

export const fetchKnowledgeArticles = async (phrase, callback) => {
  const tagsList = stopword.removeStopwords(phrase.split(' '));
  const query = new CoreAPI.SubmissionSearch(true);
  query.include(['details', 'values[Content]', 'values[Title]']);
  query.index('values[Status],values[Tags]');
  query.eq('values[Status]', 'Published');
  query.in('values[Tags]', tagsList);
  const { submissions } = await CoreAPI.searchSubmissions({
    search: query.build(),
    datastore: true,
    form: 'knowledge-articles',
  });
  callback(List(submissions));
};

export const fetchKnowledgeArticle = async (id, callback) => {
  const { submission } = await CoreAPI.fetchSubmission({
    id: id,
    datastore: true,
    include: 'details,values[Content],values[Title]',
  });
  callback(submission);
};
