'use strict';

const setup = require('./methods/setup');
const reset = require('./methods/reset');
const recommend = require('./methods/recommend');

class ML {
  constructor(hdbCore, logger) {
    this.hdbCore = hdbCore;
    this.logger = logger;

    this.trainingDataDirectory = '/data/clean';
    this.schema = 'hdbml_book_recommender';
    this.tables = ['status', 'books', 'isbn_idxs', 'user_idxs', 'ratings', 'recommendations'];
    this.recommendationsTable = 'recommendations';

    this.model = null;
  }
}

ML.prototype.setup = setup;
ML.prototype.reset = reset;
ML.prototype.recommend = recommend;

module.exports = ML;
