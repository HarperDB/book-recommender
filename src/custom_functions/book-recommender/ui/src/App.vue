<script setup>
import "./assets/base.css";

import { reactive, ref } from "vue";
import axios from "axios";

const isSetup = ref(true);
const book1 = ref("");
const book2 = ref("");
const book3 = ref("");
const books = ref([false, false, false]);
const recommendations = reactive({ recommendations: [] });

async function bookSearch(input, callback) {
  if (input.length < 5) return callback([]);
  const { data } = await axios({
    method: "get",
    url: "http://localhost:9936/book-recommender/books",
    params: {
      q: input,
    },
  });
  const titleIndexes = Object.fromEntries(
    data.map((v, i) => [v.title + v.author, i])
  );
  const uniqueResults = data.filter(
    (v, i) => i === titleIndexes[v.title + v.author]
  );
  const results = uniqueResults.map((d) => ({
    isbn: d.isbn,
    value: `${d.title} by ${d.author}`,
  }));
  callback(results);
}

function handleSelect(v, i) {
  books.value[i] = v.isbn;
}

async function recommend() {
  const { data } = await axios({
    method: "post",
    url: "http://localhost:9936/book-recommender/recommend",
    data: {
      isbns: books.value,
    },
  });
  recommendations.recommendations = data;
}
</script>

<template>
  <main>
    <header class="header">
      <img
        alt="HarperDB logo"
        class="logo"
        src="./assets/harperdb.png"
        width="125"
        height="125"
      />

      <h1>HarperDB Book Recommender</h1>
    </header>
    <section class="primary">
      <div v-if="!isSetup" class="message">
        <p>To begin, click the setup button to populate the database.</p>
        <el-button type="primary">Setup</el-button>
      </div>
      <div v-if="isSetup" class="message">
        <p>
          Select three books that you like, and then click the recommend button
          to see other books that you may enjoy reading.
        </p>
        <div class="input-container">
          <el-autocomplete
            v-model="book1"
            :fetch-suggestions="bookSearch"
            :trigger-on-focus="false"
            class="inline-input w-50"
            placeholder="Book 1"
            @select="handleSelect($event, 0)"
          />
          <el-autocomplete
            v-model="book2"
            :fetch-suggestions="bookSearch"
            :trigger-on-focus="false"
            class="inline-input w-50"
            placeholder="Book 2"
            @select="handleSelect($event, 1)"
          />
          <el-autocomplete
            v-model="book3"
            :fetch-suggestions="bookSearch"
            :trigger-on-focus="false"
            class="inline-input w-50"
            placeholder="Book 3"
            @select="handleSelect($event, 2)"
          />
        </div>
        <div style="margin-top: 25px; display: flex; justify-content: center">
          <el-button type="primary" @click="recommend" style="width: 50%"
            >Recommend</el-button
          >
        </div>
        <div style="overflow-y: auto; height: 200px">
          <div
            v-for="recommendation in recommendations.recommendations"
            :key="recommendation.isbn"
          >
            <p>
              {{ recommendation.title }} by {{ recommendation.author }} (ISBN:
              {{ recommendation.isbn }})
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style lang="scss" scoped>
#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;

  font-weight: normal;
}

header {
  display: flex;
  line-height: 1.5;
  align-items: center;
  padding-left: 25px;
  h1 {
    font-size: 18px;
    font-weight: bold;
    margin-left: 15px;
  }
  border-bottom: 1px solid black;
}

main {
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  min-height: 100vh;
}

section.primary {
  flex-grow: 1;
  display: flex;
  justify-content: center;
}

.message {
  display: flex;
  flex-direction: column;
  justify-content: center;
  p {
    font-size: 16px;
    font-weight: bold;
    margin: 15px;
  }
}
.input-container {
  width: 100%;
  display: flex;
  justify-content: space-around;
  margin: 50px 0;
  // input
}

a,
.green {
  text-decoration: none;
  color: hsla(160, 100%, 37%, 1);
  transition: 0.4s;
}
</style>
