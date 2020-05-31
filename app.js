#!/usr/bin/env node
const program = require('commander');
const clip = require('clipboardy');
const emmet = require('emmet');

/*
This entire code is spaghetti at the moment. I have documented it in bits and pieces, but it is by no means
the best version of itself. Feel free to report issues, edge cases, and suggest fixes or add enhancements.
*/

program
.option('-c, --columns <value>', 'set the number of columns', '1')
.option('-r, --rows <value>', 'set the number of rows', '1')
.option('-C, --container <type>', 'provide a container for the grid', '.grid-container')
.option('-q, --query <value>', 'generate grid with custom classes based on a query')
.option('-t, --template <value>', 'generate code based on predefined layouts')
.option('-s, --only-style', 'output only the style')
.option('-h, --only-html','output only the html')
.option('-o, --output', 'output data to screen instead of copying')
.option('-e, --emmet <value>', 'EXPERIMENTAL define custom html using emmet, wrap in quotes')
.option('-g, --no-gap', 'NOT IMPLEMENTED do not specify any padding or margin')
.option('-a, --center', 'NOT IMPLEMENTED center align the content')
.option('-p, --padding <number>', 'NOT IMPLEMENTED set the padding between columns and rows')
.option('-m, --margin <number>', 'NOT IMPLEMENTED set the margin between columns and rows')
.action(function(args){
    
    /* The command is processed starting from here */
    let html = '';
    let style = '';
    let container = args.container || '.grid-container';


    /* Get the HTML, CSS */
    if(args.query){
        let parsed = parseQuery(args.query, container);
        html = parsed.html;
        style = parsed.style;
    }
    else if (args.template){
        html = generateHTMLFrom(args.template, container);
        style = generateStyleFrom(args.template, container);
    }
    else if(args.emmet){
        html = emmet.default(args.emmet);
        style = generateStyle(args.columns, args.rows, container);
    }
    else {
        html = generateHTML(args.columns, args.rows, container);
        style = generateStyle(args.columns, args.rows, container);
    }
        
    /* Decide how it will be output */

    if(!args.output){
        if(args.onlyStyle){
            clip.writeSync(style);
        }
        else if(args.onlyHtml){
            clip.writeSync(html);    
        }
        else{
            clip.writeSync(html + '\n' + style);
        }
        console.log('Grid copied to clipboard');
    }
    else{
        if(args.onlyStyle){
            console.log(style); 
        }
        else if(args.onlyHtml){
            console.log(html);
        }
        else{
            console.log(html + '\n' + style);
        }
    }
})

program.parse(process.argv);


/**
 * Generates the HTML code based on the number of columns and rows. Not used for query parsing.
 * @param {*} c Indicates the number of columns
 * @param {*} r Indicates the number of rows
 * @param {*} container The default parent classname or the user-defined classname (if specified)
 * @returns a back-ticked string with the HTML code
 */
function generateHTML(c, r, container){
    let html = '';
    if(container){
        let generatedHtml = resolveSelectorAndGenerateHtml(container);
        console.log(generatedHtml);
        html+=generatedHtml.start;
        for(let i=0; i<c*r; i++){
            html+=`\t<div>${i+1}</div>\n`;
        }
        html+=generatedHtml.end;
    }

    return html;
}

function resolveSelectorAndGenerateHtml(container){
    let start = '';
    let end = '';

    // TODO: Verify if this breaks for any edge cases
    start = emmet.default(container).split('</')[0];
    end = '</' + emmet.default(container).split('</')[1];

    return {
        start: start,
        end: end
    }
}

/**
 * Generates the CSS based on the number of rows and columns specified. Not used for query parsing.
 * @param {*} c Indicates the number of columns
 * @param {*} r Indicates the number of rows
 * @param {*} container The default parent classname or the user-defined classname (if specified)
 * @returns a back-ticked string with the CSS
 */
function generateStyle(c, r, container){
    return `${container}{
display: grid;
grid-template-columns: repeat(${c}, 1fr);
grid-template-rows: repeat(${r}, 1fr);
grid-gap: 1em;
}`
}


/**
 * Generates both the HTML for a known template
 * @param {*} template can be one of holy-grail | 2-col | 3-col | 4-col | 2-row | 3-row | 4-row
 * @param {*} container
 * @returns a back-ticked string with the HTML
 */
function generateHTMLFrom(template, container){
    switch(template){
        case 'holy-grail': {
            return getHolyGrail(container).html;
        }
        case '2-col': {
            return generateHTML(2, 1, container);
        }
        case '3-col': {
            return generateHTML(3, 1, container);
        }
        case '4-col': {
            return generateHTML(4, 1, container);
        }
        case '2-row': {
            return generateHTML(1, 2, container);
        }
        case '3-row': {
            return generateHTML(1, 3, container);
        }
        case '4-row': {
            return generateHTML(1, 4, container);
        }

    }
}


/**
 * Generates the CSS for a known template.
 * @param {*} template can be one of holy-grail | 2-col | 3-col | 4-col | 2-row | 3-row | 4-row
 * @param {*} container
 * @returns a back-ticked string with the CSS
 */
function generateStyleFrom(template, container){
    switch(template){
        case 'holy-grail': {
            return getHolyGrail(container).style;
        }
        case '2-col': {
            return generateStyle(2, 1, container);
        }
        case '3-col': {
            return generateStyle(3, 1, container);
        }
        case '4-col': {
            return generateStyle(4, 1, container);
        }
        case '2-row': {
            return generateStyle(1, 2, container);
        }
        case '3-row': {
            return generateStyle(1, 3, container);
        }
        case '4-row': {
            return generateStyle(1, 4, container);
        }
    }
}


/**
 * Given a query, parses it and generates both the HTML and CSS
 *
 * @param {*} query The string query for generating the code
 * @param {*} container Custom classname if specified, otherwise default is used
 * @returns an object containing {html: <the-html>, css: <the-css> }
 */
function parseQuery(query, container){
    let numRows = 0;
    let numCols = 0;
    let rows = [];
    let entireRows = query.split('/');


    /* Computes the number of rows and columns and creates the "rows" array */
    entireRows.forEach(fullRow => {
        let col = fullRow.split(',');
        rows.push(col);
        numCols = Math.max(numCols, col.length);
        if(fullRow.toString().includes('*')){
            numRows+=parseInt(fullRow.toString().split('*')[1]);
        }
        else{
            numRows++;
        }
    });

// Generate the classes
let classes = buildClassesFrom(rows, numRows, numCols);

// Create the HTML
let containerHtml = resolveSelectorAndGenerateHtml(container);
html =  `${containerHtml.start}
${buildHTMLFrom(classes)}
${containerHtml.end}
`
// Create the CSS
let gridtemplateRows = '';
for(let i=0;i<numRows;i++){
    gridtemplateRows+=`1fr `;
}

let style = `${container}{
display: grid;
grid-template-rows: ${gridtemplateRows};
grid-template-columns: repeat(${numCols}, 1fr);
grid-gap: 1em;
}\n`

style+=buildStylesFrom(classes).toString();

    return {
        style: style,
        html: html
    }
}



/**
 * Given the data of rows and columns, tries to find unique classes
 *
 * @param {*} rows
 * @param {*} numRows
 * @param {*} numCols
 * @returns an array of objects containing unique classes along with values for column-start, column-end, etc.
 */
function buildClassesFrom(rows, numRows, numCols){
    let classes = {};
    let uniqueSelectors = new Set();
    let prevCol = '';
    let prevRow = -1;


    rows.forEach((row, ridx) => {
        row.forEach((col, cidx) => {
            if(!col.includes('*'))
            {
                // Selector is encountered for the first time
                if(!uniqueSelectors.has(col)){
                    classes[col] = {};
                    classes[col].padding = '1.5rem';
                    classes[col].gridColumnStart = cidx+1;
                    classes[col].gridRowStart = ridx+1;
                    uniqueSelectors.add(col);

                    // We are on a unique column, but same row
                    if(prevRow===ridx){
                        classes[prevCol].gridColumnEnd = classes[col].gridColumnStart;
                    }
                }
                else {
                    // Non-unique column but same row
                    classes[col].gridRowEnd = ridx+1; // keep same row (NB: ridx starts from 0)
                    classes[col].gridColumnEnd = cidx+2; // increase col by 1 (NB: cidx starts from 0)
                }
            }
            else{
                // TODO: Handle repeats
            }
            prevCol = col;
            prevRow = ridx;
        })
    })

    // Computes the gridRowEnd and gridColumnEnd properties for classes that were at the end of the row
    uniqueSelectors.forEach(cssClass => {
        if( !classes[cssClass].gridRowEnd ) {
            classes[cssClass].gridRowEnd = classes[cssClass].gridRowStart;
        }

        if(!classes[cssClass].gridColumnEnd){
            classes[cssClass].gridColumnEnd = numCols+1;
        }
    })

    return classes;
}


/**
 * Builds HTML based on the classes created by the buildClassesFrom(...) function
 *
 * @param {*} selectors
 * @returns
 */
function buildHTMLFrom(selectors){
    let html = '';
    for(key in selectors){
        let generatedHtml = resolveSelectorAndGenerateHtml(key);
        html+=generatedHtml.start + generatedHtml.end;
        // html+=`<div class="${key}">${key}</div>\n`
    }
    return html;
}


/**
 * Builds CSS based on the classes created by the buildClassesFrom(...) function
 *
 * @param {*} selectors
 * @returns
 */
function buildStylesFrom(selectors){
    let style = '';
    for(let key in selectors){
style+=`${key}{
padding: ${selectors[key].padding};
grid-column: ${selectors[key].gridColumnStart} / ${selectors[key].gridColumnEnd};
grid-row: ${selectors[key].gridRowStart} / ${selectors[key].gridRowEnd};
background: #eaeaea;
}\n`

}
    return style;

}

/* TEMPLATES ARE STORED BELOW THIS POINT */
function getHolyGrail(container){
    return {
        html: `<div class="${container}">
        <header>
          Header
        </header>
      
        <aside class="sidebar-left">
          Left Sidebar
        </aside>
      
        <article>
          Article
        </article>
      
        <aside class="sidebar-right">
          Right Sidebar
        </aside>
        
        <footer>
          Footer
        </footer>
      </div>`,
      style : `.${container} {
        display: grid;
        grid-template-columns: 150px auto 150px;
        grid-template-rows: repeat(3, 100px);
        grid-gap: 1em;
      }
      
      header,
      aside,
      article,
      footer {
        background: #eaeaea;
        padding: 1em;
      }
      
      header, footer {
        grid-column: 1 / 4;
      }`
    }
}

// gridQuery examples
// Default unit is assumed as fr
/*
a-a-f-f/b-c-c-cx3

a/b-c-c-dx3/e

a/b-c-c-c/d
header/sidebar-content-content-content/footer1-footer1-footer2-footer2

*/
