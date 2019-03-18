const fs = require('fs');

// External modules:
const _ = require('lodash')

const read = (path) => new Promise((resolve, reject) => {
  fs.readFile(path, 'utf8', (error, data) => {
    if (error) reject(error)
    else resolve(data)
  });
})

const regexes = [
  // BOLD
  {
    regex: /\*\*(\w*)\*\*/g,
    render: (x) => {
      return `<b>${x}</b>`;
    }
  },
  // CODE
  {
    regex: /\`(\w*)\`/g,
    render: (x) => {
      return `<code>${x}</code>`;
    }
  },
]

const renderR = (text) => {
  let objects = regexes.reduce((xd, regex) => {
    const match = regex.regex.exec(text);
    regex.regex.lastIndex = 0;

    if (match) {
      xd.push({
        text: match[0],
        word: match[1],
        index: match.index,
        input: match.input
      });
    };

    return xd
  }, [])

  objects = _.sortBy(objects, ['index']);

  if (objects.length > 0) {


    const first = objects[0];

    return {
      processedText: text.slice(0, first.index) + regexes[0].render(first.word),
      notProcessedText: text.slice(first.index + first.text.length),
    }
  } else {
    // console.log(text);
    return {
      processedText: text,
      notProcessedText: '',
    }

  }
}


const render = function* (text) {
  while (text) {
    const { processedText, notProcessedText } = renderR(text);

    yield processedText

    text = notProcessedText;
  }
}

const main = async () => {
  const text = await read('README.md');
  const generator = render(text);


  let xd = ''

  for (const processed of generator) {
    xd += processed;
  }

  console.log(xd)
}

main();
