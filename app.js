#!/usr/bin/env node
const program = require('commander');
const clip = require('clipboardy');
const emmet = require('emmet');

/*
This entire code is spaghetti at the moment. I have documented it in bits and pieces, but it is by no means
the best version of itself. Feel free to report issues, edge cases, and suggest fixes or add enhancements.
*/

program.on('--help', () => {
    console.log(`\nThe query notation is different for get-grid@1.0.1 and get-grid@2.0.0.
Columns are now separated using "," instead of "-".
You can also specify one-level deep CSS selectors in the query now (classes, IDs, tags) and the relevant HTML and CSS for them will be generated.
For example:
get-grid -Hdq header/aside,.content,.content,.content/footer.left-footer,footer.left-footer,footer.right-footer,footer.right-footer
Try it out! 

You can use the -H and the -d flags to highlight the generated HTML and add default padding/margin.

E.g. 
get-grid -Hdq header/aside,.content,.content,.content/footer.left-footer,footer.left-footer,footer.right-footer,footer.right-footer
`)
})

program
.option('-c, --columns <value>', 'set the number of columns', '1')
.option('-r, --rows <value>', 'set the number of rows', '1')
.option('-C, --container <type>', 'provide a container for the grid', '.grid-container')
.option('-q, --query <value>', 'generate grid with custom classes based on a query')
.option('-t, --template <value>', 'generate code based on predefined layouts')
.option('-s, --only-style', 'output only the style')
.option('-h, --only-html','output only the html')
.option('-o, --output', 'output data to screen instead of copying')
.option('-d, --default', 'Adds a default margin and padding to elements')
.option('-H, --highlight', 'Adds a default background color and border to elements')
.option('-e, --emmet <value>', 'EXPERIMENTAL define custom html using emmet, wrap in quotes')
.option('-g, --no-gap', 'NOT IMPLEMENTED / REDUNDANT do not specify any padding or margin')
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
        let parsed = parseQuery(args.query, container, args.default, args.highlight);
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

    // TODO: Verify if this breaks for any edge cases [it is assumed here that only ONE element will be specified]
    start = emmet.default(container).split('</')[0];
    end = '</' + emmet.default(container).split('</')[1]+'\n';

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
 * @param {String} query The string query for generating the code
 * @param {String} container Custom classname if specified, otherwise default is used
 * @param {Boolean} defaults Boolean value which determines whether default padding/margin should be set
 * @param {Boolean} highlights Value which determine whether background and borders should be set
 * @returns an object containing {html: <the-html>, css: <the-css> }
 */
function parseQuery(query, container, defaults, highlights){
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

// Generate the selectors
let selectors = buildSelectorsFrom(rows, numRows, numCols);

// Create the HTML
let containerHtml = resolveSelectorAndGenerateHtml(container);
html =  `${containerHtml.start}
${buildHTMLFrom(selectors, defaults, highlights)}
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
`

if(defaults){
    style+= `grid-gap: 1em;
    `;
}
style+=`}\n`;

style+=buildStylesFrom(selectors, defaults, highlights).toString();

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
function buildSelectorsFrom(rows, numRows, numCols){
    let selectors = {};
    let uniqueSelectors = new Set();
    let prevCol = '';
    let prevRow = -1;


    rows.forEach((row, ridx) => {
        row.forEach((col, cidx) => {
            if(!col.includes('*'))
            {
                // Selector is encountered for the first time
                if(!uniqueSelectors.has(col)){
                    selectors[col] = {};
                    selectors[col].padding = '1.5rem';
                    selectors[col].gridColumnStart = cidx+1;
                    selectors[col].gridRowStart = ridx+1;
                    uniqueSelectors.add(col);

                    // We are on a unique column, but same row
                    if(prevRow===ridx){
                        selectors[prevCol].gridColumnEnd = selectors[col].gridColumnStart;
                    }
                }
                else {
                    // Non-unique column but same row
                    selectors[col].gridRowEnd = ridx+1; // keep same row (NB: ridx starts from 0)
                    selectors[col].gridColumnEnd = cidx+2; // increase col by 1 (NB: cidx starts from 0)
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
        if( !selectors[cssClass].gridRowEnd ) {
            selectors[cssClass].gridRowEnd = selectors[cssClass].gridRowStart;
        }

        if(!selectors[cssClass].gridColumnEnd){
            selectors[cssClass].gridColumnEnd = numCols+1;
        }
    })

    return selectors;
}


/**
 * Builds HTML based on the classes created by the buildClassesFrom(...) function
 *
 * @param {*} selectors
 * @returns
 */
function buildHTMLFrom(selectors, defaults, highlights){
    let html = '';
    for(key in selectors){
        let generatedHtml = resolveSelectorAndGenerateHtml(key);
        html+=generatedHtml.start;
        if(highlights){
            html+=key;
        }
        html+=generatedHtml.end;
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
function buildStylesFrom(selectors, defaults, highlights){
    let style = '';
    for(let key in selectors){
style+=`${key}{
grid-column: ${selectors[key].gridColumnStart} / ${selectors[key].gridColumnEnd};
grid-row: ${selectors[key].gridRowStart} / ${selectors[key].gridRowEnd};
`
    if(defaults){
        style+=`padding: ${selectors[key].padding};\n`;
    }
    if(highlights){
        style+=`background: #eaeaea;\n`
    }
    style+="}\n"
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
