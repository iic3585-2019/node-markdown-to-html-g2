const fs = require('fs');

const readFile = path =>
  new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });

const writeFile = (string, path) =>
  new Promise((resolve, reject) => {
    fs.writeFile(path, string, 'utf8', (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });

module.exports = { readFile, writeFile };
