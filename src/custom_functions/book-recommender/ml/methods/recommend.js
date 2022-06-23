'use strict';

const path = require('path');
const tf = require('@tensorflow/tfjs-node');

async function recommend(isbns) {
  if (!this.model) {
    const modelPath = path.join(__dirname, '../', 'tfjs-model', 'model.json');
    this.model = await tf.loadGraphModel(`file://${modelPath}`);
  }
  const isbnIdxs = await Promise.all(isbns.map(async isbn => {
    const results = await this.hdbCore.requestWithoutAuthentication({
      body: {
        operation: 'search_by_value',
        schema: 'hdbml_book_recommender',
        table: 'isbn_idxs',
        search_attribute: 'isbn',
        search_value: isbn,
        get_attributes: ['index']
      }
    })
    return results[0].index
  }))

  const inputTensor = tf.tensor([isbnIdxs], [1, 3], 'int32')
  const results = this.model.execute(inputTensor)
  const r0 = await results[0].data()
  // the first elemnt is not always the recommended index, so we check
  const recommendationsArray = r0.constructor === Int32Array ? r0 : await results[1].data()
  const recommendedUserIdx = recommendationsArray[0]
  const recommendedUserIds = await this.hdbCore.requestWithoutAuthentication({
    body: {
      operation: 'search_by_value',
      schema: 'hdbml_book_recommender',
      table: 'user_idxs',
      search_attribute: 'index',
      search_value: recommendedUserIdx,
      get_attributes: ['user_id']
    }
  })

  const user_id = recommendedUserIds[0].user_id

  const userRatingsAll = await this.hdbCore.requestWithoutAuthentication({
    body: {
      operation: 'search_by_value',
      schema: 'hdbml_book_recommender',
      table: 'ratings',
      search_attribute: 'user_id',
      search_value: user_id,
      get_attributes: ['*']
    }
  })
  const userRatings = userRatingsAll.filter(userRating => isbns.indexOf(userRating.isbn) === -1)

  const ratingCounts = userRatings.reduce((a, v) => {
    a[v.rating] = a[v.rating] ? a[v.rating] + 1 : 1;
    return a;
  }, {});
  const targetRatingCount = 5;
  let goodRating = 10;
  let currentRatingCount = 0;
  for (let rating = 10; rating > 5; rating--) {
    console.log('rating', rating)
    currentRatingCount += ratingCounts[rating] || 0;
    if (currentRatingCount >= targetRatingCount) {
      goodRating = rating;
      break;
    }
  }

  const recommendedIsbns = userRatings.filter(userRating => userRating.rating >= goodRating).map(userRating => userRating.isbn)

  const recommendedBooks = await Promise.all(recommendedIsbns.map(async isbn => {
    const results = await this.hdbCore.requestWithoutAuthentication({
      body: {
        operation: 'search_by_value',
        schema: 'hdbml_book_recommender',
        table: 'books',
        search_attribute: 'isbn',
        search_value: isbn,
        get_attributes: ['*']
      }
    })
    console.log('results', results)
    return results[0]
  }))

  await this.hdbCore.requestWithoutAuthentication({
    body: {
      operation: 'insert',
      schema: this.schema,
      table: this.recommendationsTable,
      records: [
        {
          isbns,
          recommendedIsbns
        }
      ]
    }
  });

  return recommendedBooks
}

module.exports = recommend
