const fs = require('fs');

// External modules:
const _ = require('lodash')

const readFile = (path) => new Promise((resolve, reject) => {
  fs.readFile(path, 'utf8', (error, data) => {
    if (error) reject(error)
    else resolve(data)
  });
})

const processors = {
  header: {
    regexp: /(#+)(.+)/g,
    process(string) {
      return _.replace(string, this.regexp, (match, g1, g2) => {
        const length = g1.length;

        return `<h${length}>${g2}</h${length}>`;
      });
    }
  },
  links: {
    regexp: /\[([^\[]+)\]\(([^\)]+)\)/g,
    process(string) {
      return _.replace(string, this.regexp, '<a href=\"$2\">$1</a>');
    }
  },
  bold: {
    regexp: /(\*\*|__)([^\*\s]+)\1/g,
    process(string) {
      return _.replace(string, this.regexp, '<strong>$2</strong>');
    },
  },
  emphasis: {
    regexp: /(\*|_)([^\*\s]+)\1/g,
    process(string) {
      return _.replace(string, this.regexp, '<em>$2</em>');
    },
  },
  del: {
    regexp: /\~\~(.*?)\~\~/g,
    process(string){
      return _.replace(string, this.regexp, '<del>$1</del>');
    }                          
  },
  code: {
    regexp: /`(.*?)`/g,
    process(string){
      return _.replace(string, this.regexp, '<code>$1</code>');      
    }            
  },
  blockquote: {
    regexp: /\n(&gt;|\>)(.*)/g,
    process(string){
      return _.replace(string, this.regexp, (match, g1, g2) => {
        const length = g1.length;

        return `<h${length}>${g2}</h${length}>`;
      });
    }            
  },
}

const regexpPipeline = processors => markdown => {
  const processedMarkdown = processors.reduce((prevMarkdown, currentProcessor) => {
    return currentProcessor.process(prevMarkdown)
  }, markdown);

  return processedMarkdown
}

const markdownToHTML = (markdown) => {
  const pipeline = regexpPipeline(Object.values(processors))

  return pipeline(markdown);
}

const main = async () => {
  const markdown = await readFile('README.md');
  const html = markdownToHTML(markdown);

  console.log(html)
}

main();
