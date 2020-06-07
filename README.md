Install the tool from npm:
```shell
npm i get-grid -g
```

You should probably read [this article on dev.to](https://dev.to/saunved/a-cli-tool-for-creating-css-grid-layouts-2aj4) to find out more about get-grid.

# How to use get-grid

### Creating grids using rows and columns
* Create a grid with 4 rows having 3 columns each:
```shell
get-grid -c3 -r4
```

* Create a grid with 3 rows and 3 columns, and specify a container:
```shell
get-grid -c3 -r3 --container "article.gallery"
```

### Creating grids using the query

The "query" is a way of representing a CSS grid on the CLI.
Each row of the grid is separated using "/" (forward slash) and each column is separated using a "," (comma)

#### Some examples to help you get started

* Create a simple webpage layout:
```shell
get-grid -dH --query "header/aside,.content,.content/footer" 
```

*You can read the above query as:
"On the 1st row, create a header. On the 2nd row create one-third of an aside, and two thirds of .content. On the last row, create a footer."*

You can use "-d" and "-H" flags to add default margin/padding and add background, naming respectively.

* You can use IDs, classes, web components, semantic HTML
```shell
get-grid -dH --query "header/aside#left-aside,article,article,custom-widget/footer.social-media/footer.links"
```

* Holy-grail using get-grid
```shell
get-grid -dH --query "header/aside.left-aside,.content,.content,aside.right-aside/footer"
```

* Another common layout (say, for mobile)
```shell
get-grid -dH --container "div.mobile-site" --query "header/nav#menu/.content/footer"
```

If a row contains only 1 column that spans the full width, there is no need to specify it more than once.
However, if a row contains more than 1 column, all the columns must be explicitly specified. There is work in progress to take care of such repeats.

### You can read about more options by looking at the help
```shell
get-grid --help
```
There are options to output directly to console, to geto only the style or only the HTML, etc.
* * *

### Contributing / testing
If you would like to contribute, you will have to understand how [commander.js](https://www.npmjs.com/package/commander) works since we are using that to create the CLI. I have tried documenting the functions in the ```app.js``` file. Feel free to optimize code, report bugs, or add new features.

Specific areas where you can contribute:
1. Improve the existing tests
2. Create extensions/plugins for popular IDEs (to create CSS grids inside the IDE itself)
3. Add more predefined templates to the tool

To run the tool locally, you can simply run:
```shell
npm i . -g
```

If npm throws an error, change the package version number in the package.json file and retry.
* * *
You can run tests using 
```shell
npm run test
```
or 
```shell
npm run coverage
```
to get a coverage report for the test.