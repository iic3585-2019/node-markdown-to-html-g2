const fs = require('fs');

// External modules:
const _ = require('lodash');

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

const processors = {
  header: {
    regexp: /(#+)(.+)/g,
    process(string) {
      return _.replace(string, this.regexp, (match, g1, g2) => {
        const length = g1.length;

        return `<h${length}>${_.trim(g2)}</h${length}>`;
      });
    },
  },
  links: {
    regexp: /\[([^\[]+)\]\(([^\)]+)\)/g,
    process(string) {
      return _.replace(string, this.regexp, '<a href="$2">$1</a>');
    },
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
    process(string) {
      return _.replace(string, this.regexp, '<del>$1</del>');
    },
  },
  code: {
    regexp: /`(.*?)`/g,
    process(string) {
      return _.replace(string, this.regexp, '<code>$1</code>');
    },
  },
  ul: {
    regexp: /\n[\*-](.*)/g,
    process(string) {
      return _.replace(string, this.regexp, (match, g1) => {
        return `\n<ul>\n\t<li>${_.trim(g1)}</li>\n</ul>`;
      });
    },
  },
  ol: {
    regexp: /\n[0-9]+\.(.*)/g,
    process(string) {
      return _.replace(string, this.regexp, (match, g1) => {
        return `\n<ol>\n\t<li>${_.trim(g1)}</li>\n</ol>`;
      });
    },
  },
  blockquote: {
    regexp: /\n(&gt;|\>)(.*)/g,
    process(string) {
      return _.replace(string, this.regexp, (match, g1, g2) => {
        return `\n<blockquote>${_.trim(g2)}</blockquote>`;
      });
    },
  },
  horizontal: {
    regexp: /\n-{3,}/g,
    process(string) {
      return _.replace(string, this.regexp, '\n<hr />');
    }
  },
  paragraph: {
    regexp: /\n([^\n]+)\n/g,
    process(string) {
      return _.replace(string, this.regexp, '\n<p>$1</p>');
    }
  },
  clearUl: {
    regexp: /<\/ul>\s?<ul>/g,
    process(string) {
      return _.replace(string, this.regexp, '');
    },
  },
  clearOl: {
    regexp: /<\/ol>\s?<ol>/g,
    process(string) {
      return _.replace(string, this.regexp, '');
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
