// External modules:
const _ = require('lodash');

// Internal modules:
const { readFile, writeFile } = require('./helpers.js');

const processors = {
  headline: {
    regexp: /(#+\s*)(.*)/g,
    process(string) {
      return _.replace(string, this.regexp, (match, g1, g2) => {
        const length = _.trim(g1).length;

        return `<h${length}>${_.trim(g2)}</h${length}>`;
      });
    },
  },

  image: {
    regexp: /!\[([^[]+)\]\(([^)]+)\)/g,
    process(string) {
      return _.replace(string, this.regexp, '<img src="$2" alt="$1" />');
    },
  },

  link: {
    regexp: /\[([^[]+)\]\(([^)]+)\)/g,
    process(string) {
      return _.replace(string, this.regexp, '<a href="$2">$1</a>');
    },
  },

  bold: {
    regexp: /(\*\*|__)([^\1\s])(.*?)\1/g,
    process(string) {
      return _.replace(string, this.regexp, '<strong>$2$3</strong>');
    },
  },

  emphasis: {
    regexp: /(\*|_)([^\1\s])(.*?)\1/g,
    process(string) {
      return _.replace(string, this.regexp, '<em>$2$3</em>');
    },
  },

  delete: {
    regexp: /(~~)([^\1\s])(.*?)\1/g,
    process(string) {
      return _.replace(string, this.regexp, '<del>$2$3</del>');
    },
  },

  code: {
    regexp: /(`)(.*?)\1/g,
    process(string) {
      return _.replace(string, this.regexp, '<code>$2</code>');
    },
  },

  ul: {
    regexp: /(\n\s*(\*|-)\s.*)+/g,
    process(string) {
      const _regexp = /\s*(\*|-)\s(.*)/g;

      return _.replace(string, this.regexp, (match, g1) => {
        const items = match
          .trim()
          .split('\n')
          .map(item => _.trim(_.replace(item, _regexp, '$2')))
          .reduce((prev, current) => prev + `<li>${current}</li>`, '');

        return `\n<ul>${items}</ul>`;
      });
    },
  },

  ol: {
    regexp: /(\n\s*([0-9]+\.)\s.*)+/g,
    process(string) {
      const _regexp = /\s*([0-9]+\.)\s(.*)/g;

      return _.replace(string, this.regexp, (match, g1) => {
        const items = match
          .trim()
          .split('\n')
          .map(item => _.trim(_.replace(item, _regexp, '$2')))
          .reduce((prev, current) => prev + `<li>${current}</li>`, '');

        return `\n<ol>${items}</ol>`;
      });
    },
  },

  blockquote: {
    regexp: /\n(&gt;|>)(.*)/g,
    process(string) {
      return _.replace(string, this.regexp, (match, g1, g2) => {
        return `\n<blockquote>${_.trim(g2)}</blockquote>`;
      });
    },
  },

  horizontal: {
    regexp: /\n((-{3,})|(\*{3,}))/g,
    process(string) {
      return _.replace(string, this.regexp, '\n<hr />');
    },
  },

  paragraph: {
    regexp: /\n+(?!<pre>)(?!<h)(?!<ul>)(?!<blockquote)(?!<hr)(?!\t)([^\n]+)/g,
    process(string) {
      return _.replace(string, this.regexp, '\n<p>$1</p>');
    },
  },

  clearBlockquote: {
    regexp: /<\/blockquote><blockquote>/g,
    process(string) {
      return _.replace(string, this.regexp, '\n');
    },
  },
};

const regexpPipeline = processors => markdown => {
  const processedMarkdown = processors.reduce(
    (prevMarkdown, currentProcessor) => currentProcessor.process(prevMarkdown),
    markdown
  );

  return processedMarkdown;
};

const markdownToHTML = markdown => {
  const pipeline = regexpPipeline(Object.values(processors));

  return pipeline(markdown);
};

const main = async () => {
  const [input_path, output_path] = process.argv.slice(2);

  const markdown = await readFile(input_path);
  const html = markdownToHTML(markdown);

  writeFile(html, output_path);
};

main();
