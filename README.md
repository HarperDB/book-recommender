# HarperDB Book Recommender
The HarperDB Book Recommender is a Custom Function for [HarperDB](https://harperdb.io/) that produces book recommendations.

The user selects three of their favorite books, and the recommender returns other titles that the user is likely to enjoy.

## Summary
This is a [TensorFlow Recommendation System](https://www.tensorflow.org/recommenders) project that uses the data from the [Kaggle Book Recommendation Dataset](https://www.kaggle.com/datasets/arashnic/book-recommendation-dataset) to create an example book recommendation application using [HarperDB Custom Functions](https://harperdb.io/docs/custom-functions/).

## How to Use
Visit the [HarperDB Book Recommender UI](http://localhost:9936/book-recommender/ui) and use the three search boxes to find three of your favorite books, then click the Recommend button to see the top results.

## How to Setup
This project uses a local instance of the HarperDB database contained in a Dockerfile. To setup the environment you will need a free [HarperDB Account](https://studio.harperdb.io/sign-up) and Docker installed on your system.
1. In the project directory (where this repo is located on your machine) run `make`. This will download and start the database container. Check back here to view the logs.
2. In another window, once the database has started, run `curl http://localhost:9936/book-recommender/setup` to begin the HDBML environment setup (creating the schema and loading the training data). This will take about five minutes, and you can run this command again to check on the status of the setup.
3. Once the setup has completed, visit the UI in your browser at [http://localhost:9936/book-recommender/ui/](http://localhost:9936/book-recommender/ui/).

