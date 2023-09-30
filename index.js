const express = require("express");
const axios = require("axios");
const _ = require('lodash');
const app = express();

const PORT = process.env.PORT || 8090;
let arr;

app.use(express.json());
app.use(async (req, res, next) => {
  try {
    data = await axios.get("https://intent-kit-16.hasura.app/api/rest/blogs", {
      headers: {
        "x-hasura-admin-secret":
          "32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6",
      },
    });
    arr = data.data.blogs;
    next();
  } catch (error) {
    res.send(error);
  }
});

async function analystics_middleware(req, res, next) {
  try {
    const total_length = arr.length;
    let long_length = 0;
    let longest_title = "";
    let contain_word_intitle = 0;
    var titles = [];
    await arr.map((element) => {
      if (element.title.length > long_length) {
        longest_title = element.title;
        long_length = element.title.length;
      }
      if (element.title.toLowerCase().includes("privacy")) {
        contain_word_intitle++;
      }
      if (titles.indexOf(element.title) == -1) {
        titles.push(element.title);
      }
    });
    const resp = {
      total_length,
      longest_title,
      contain_word_intitle,
      unique_title: titles,
    };
    res.send(resp);
  } catch (error) {
    res.send(error);
  }
  next();
}

async function search_middleware(req, res, next) {
  try {
    let queryString = req.query.query;
    var titles = [];
    arr.map((element) => {
      if (element.title.toLowerCase().includes(queryString)) {
        if (titles.indexOf(element.title) == -1) {
          titles.push(element.title);
        }
      }
    });
    res.send({ searchResult: titles });
  } catch (error) {
    res.send(error);
  }
  next();
}

const memoized_analystics_middleware = _.memoize(analystics_middleware);
const memoized_search_middleware = _.memoize(search_middleware);

app.get("/api/blog-stats", memoized_analystics_middleware, (req, res) => {
  console.log("here....");
});

app.get("/api/blog-search?", memoized_search_middleware, (req, res) => {
  console.log("search end");
});

app.get("/", (req, res) => {
  res.send("done");
});

app.listen(PORT, () => {
  console.log("running");
});
