const inquirer = require("inquirer");
const axios = require("axios");
const fs = require("fs");
const pdf = require('html-pdf')

const generateHTML = require("./generateHTML");

const util = require("util");
const writeFileAsync = util.promisify(fs.writeFile);

const questions = [
  {
    type: "input",
    name: "username",
    message: "What is your github username?"
  },
  {
    type: "list",
    name: "color",
    message: "What is your favorite color?",
    choices: ["green", "blue", "pink", "red"]
  }
];

function firstCall() {
  return new Promise(function (resolve, reject) {
    inquirer.prompt(questions).then(async function (answers) {
      //questions.username & questions.color
      const { username, color } = answers;
      const queryUrl = `https://api.github.com/users/${username}`;
      try {
        const response = await axios.get(queryUrl);
        const stars = await secondCall(username);
        resolve({
          ...response.data,
          color,
          stars
        });
      } catch (error) {
        reject(error);
      }

    });
  });
}



function secondCall(username) {
  const queryUrl2 = `https://api.github.com/users/${username}/starred`;
  return axios
    .get(queryUrl2)
    .then(function (res) {
      const repos = res.data.length;
      return repos;
    });
}



init();

async function init(repos) {
  try {
    const data = await firstCall();
    const html = generateHTML(data);
    await writeFileAsync('./profile.html', html);
    pdf.create(html).toFile('./profile.pdf', function (err, res) {
      if (err) throw err;
      console.log(res)
    })
  } catch (error) {
    console.log(error);
  }
}