# Delven transpiller setup


## Setup

https://medium.com/javascript-in-plain-english/typescript-with-node-and-express-js-why-when-and-how-eb6bc73edd5d
https://github.com/doczjs/docz/


```bash
nvm use v12.18.0
npm install --save-dev babel-loader @babel/core
```

## Start publishing changes 

```bash
 ./node_modules/.bin/babel --watch src --out-dir dist --extensions '.ts'  --source-maps inline

```
Run ESLint 

```bash
npx eslint ./src/
```

## Reference

Notes

### Grammars

https://github.com/antlr/grammars-v4/tree/master/javascript/javascript
https://stackoverflow.com/questions/1786565/ebnf-for-ecmascript

https://stackoverflow.com/questions/1786565/ebnf-for-ecmascript

https://github.com/babel/babel/tree/master/packages
https://babeljs.io/docs/en/plugins


https://babeljs.io/videos

https://dzone.com/articles/create-a-transpiler-from-vba-to-vbnet
https://tomassetti.me/parse-tree-abstract-syntax-tree/

estree 
https://astexplorer.net/

https://github.com/dat2/ecmascript
https://github.com/jquery/esprima/


https://helpx.adobe.com/experience-manager/6-5/sites/developing/using/reference-materials/javadoc/org/mozilla/javascript/ast/AstNode.html#debugPrint--
### Webdriver

https://webdriver.io/
https://github.com/webdriverio/webdriverio
https://docs.microsoft.com/en-us/azure/data-lake-analytics/data-lake-analytics-u-sql-get-started
https://www.w3.org/TR/webdriver1
