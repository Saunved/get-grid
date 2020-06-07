const app = require('./app');
const {$, $$} = require('qree');

describe('generateHTML', () => {
    test('should give an output', () => {
        expect(app._generateHTML(2,2,'.grid-container'))
        .toBeDefined();
    })

    test('should be a string', () => {
        expect(typeof app._generateHTML(2,2,'.grid-container'))
        .toBe('string');
    })

    test('should have the specified container', () => {
        expect(app._generateHTML(2,2,'aside'))
        .toContain('aside');
    })

    test('should have equal opening and closing tags', () => {
        const generatedHtml = app._generateHTML(2,5,'.grid-container');
        const openTags = generatedHtml.split('<div').length;
        const closeTags = generatedHtml.split('</div>').length;
        expect(openTags)
        .toEqual(closeTags)
    })
})

describe('resolveSelectorAndGenerateHTML', () => {
    test('should give an output', () => {
        expect(app._resolveSelectorAndGenerateHtml('aside'))
        .toBeDefined();
    })

    test('should be an object', () => {
        expect(typeof app._resolveSelectorAndGenerateHtml('aside'))
        .toBe('object');
    })

    test('should contain start and end keys', () => {
        let html = app._resolveSelectorAndGenerateHtml('aside');
        expect(html.start).toBeDefined();
        expect(html.end).toBeDefined();
    })
    

    test('should accept semantic HTML tags', () => {
        let html = app._resolveSelectorAndGenerateHtml('aside');
        expect(html.start.trim()).toEqual('<aside>')
        expect(html.end.trim()).toEqual('</aside>')
    })

    test('should accept IDs', () => {
        let html = app._resolveSelectorAndGenerateHtml('#someid');
        expect(html.start.trim()).toEqual('<div id="someid">')
        expect(html.end.trim()).toEqual('</div>')
    })

    test('should accept classes', () => {
        let html = app._resolveSelectorAndGenerateHtml('.someclass');
        expect(html.start.trim()).toEqual('<div class="someclass">')
        expect(html.end.trim()).toEqual('</div>')
    })

    test('should accept classes with a -', () => {
        let html = app._resolveSelectorAndGenerateHtml('.some-class');
        expect(html.start.trim()).toEqual('<div class="some-class">')
        expect(html.end.trim()).toEqual('</div>')
    })

    test('should accept web components', () => {
        let html = app._resolveSelectorAndGenerateHtml('some-component');
        expect(html.start.trim()).toEqual('<some-component>')
        expect(html.end.trim()).toEqual('</some-component>')
    })

    test('should create classes for containers', () => {
        let html = app._resolveSelectorAndGenerateHtml('some-component.class');
        expect(html.start.trim()).toEqual('<some-component class="class">')
        expect(html.end.trim()).toEqual('</some-component>')
    })

    test('should create IDs for containers', () => {
        let html = app._resolveSelectorAndGenerateHtml('some-component#id');
        expect(html.start.trim()).toEqual('<some-component id="id">')
        expect(html.end.trim()).toEqual('</some-component>')
    })
})

describe('getQueryRows', () => {

    let rows, numRows, numCols;
    beforeAll(() => {
        let queryRows = app._getQueryRows("body/aside,article,article/footer");
        rows = queryRows.rows;
        numRows = queryRows.numRows;
        numCols = queryRows.numCols;
    })
    
    test('should give an output', () => {
        expect(rows).toBeDefined();
        expect(numRows).toBeDefined();
        expect(numCols).toBeDefined();
    })

    test('number of rows, columns output should be correct', () => {
        expect(rows.length).toEqual(3);
        expect(numRows).toEqual(3);
        expect(numCols).toEqual(3);
    })

    test('rows should be created correctly', () => {
        expect(rows[0]).toEqual(['body'])
        expect(rows[1]).toEqual(['aside','article','article'])
        expect(rows[2]).toEqual(['footer'])
    })

})

describe('buildSelectorDataForQuery', () => {

    let rows, numRows, numCols, selectors;
    beforeAll(() => {
        let queryRows = app._getQueryRows("body/aside,article,article/footer");
        rows = queryRows.rows;
        numRows = queryRows.numRows;
        numCols = queryRows.numCols;
        selectors = app._buildSelectorDataForQuery(rows, numRows, numCols)
    })
    test('should give an output', () => {
        expect(selectors)
        .toBeDefined();
    })

    test('should output an array with unique selectors #1', () => {
        expect(selectors['body']).toBeDefined();
        expect(selectors['aside']).toBeDefined();
        expect(selectors['article']).toBeDefined();
        expect(selectors['footer']).toBeDefined();
    })

    test('should output an array with unique selectors #2', () => {
        let {rows, numRows, numCols} = app._getQueryRows("header/aside,.content,.content/footer");
        let selectors = app._buildSelectorDataForQuery(rows, numRows, numCols);
        // console.log(selectors);
        expect(selectors['header']).toBeDefined();
        expect(selectors['aside']).toBeDefined();
        expect(selectors['.content']).toBeDefined();
        expect(selectors['footer']).toBeDefined();
    })

    test('should output an array with unique selectors #2', () => {
        let {rows, numRows, numCols} = app._getQueryRows("body.body/aside#one,.content,.content,aside#two/footer");
        let selectors = app._buildSelectorDataForQuery(rows, numRows, numCols);
        expect(selectors['body.body']).toBeDefined();
        expect(selectors['aside#one']).toBeDefined();
        expect(selectors['.content']).toBeDefined();
        expect(selectors['aside#two']).toBeDefined();
        expect(selectors['footer']).toBeDefined();
    })

})

describe('buildHTMLForQuery', () => {

    let rows, numRows, numCols, selectors;
    beforeAll(() => {
        let queryRows = app._getQueryRows("header/aside,.content,.content/footer");
        rows = queryRows.rows;
        numRows = queryRows.numRows;
        numCols = queryRows.numCols;
        selectors = app._buildSelectorDataForQuery(rows, numRows, numCols);
    })

    test('should give an output', () => {
        expect(app._buildHTMLForQuery(selectors, false, false))
        .toBeDefined();
    })

    test('should be a string', () => {
        expect(typeof app._buildHTMLForQuery(selectors, false, false))
        .toEqual('string');
    })

    test('should output all the selectors in the HTML', () => {
        let generatedHtml = app._buildHTMLForQuery(selectors, false, false);
        document.body.innerHTML = generatedHtml;
        expect($('header')).toBeDefined();
        expect($('aside')).toBeDefined();
        expect($('.content')).toBeDefined();
        expect($('footer')).toBeDefined();
        expect($('random')).toBe(null);
    })

    test('should respect highlights', () => {
        let generatedHtml = app._buildHTMLForQuery(selectors, false, true)
        document.body.innerHTML = generatedHtml;
        expect($('header').innerHTML).toEqual('header');
        expect($('aside').innerHTML).toEqual('aside');
        expect($('.content').innerHTML).toEqual('.content');
        expect($('footer').innerHTML).toEqual('footer');
    })
})

describe('buildStylesForQuery', () => {

    let rows, numRows, numCols, selectors;
    beforeAll(() => {
        let queryRows = app._getQueryRows("header/aside,.content,.content/footer");
        rows = queryRows.rows;
        numRows = queryRows.numRows;
        numCols = queryRows.numCols;
        selectors = app._buildSelectorDataForQuery(rows, numRows, numCols);
    })

    test('should give an output', () => {
        expect(app._buildStylesForQuery(selectors, false, false))
        .toBeDefined()
    })

    test('should be a string', () => {
        expect(typeof app._buildStylesForQuery(selectors, false, false))
        .toEqual('string')
    })

    test('should output correct CSS', () => {
        let generatedHtml = app._buildHTMLForQuery(selectors, false, false);
        let css = app._buildStylesForQuery(selectors, false, false);
        document.head.insertAdjacentHTML("beforeend", `<style>${css}</style>`)
        document.body.innerHTML = generatedHtml;
        expect(window.getComputedStyle($('header')).gridColumn).toBe('1 / 4')
        expect(window.getComputedStyle($('header')).gridRow).toBe('1 / 1')
        expect(window.getComputedStyle($('aside')).gridColumn).toBe('1 / 2')
        expect(window.getComputedStyle($('aside')).gridRow).toBe('2 / 2')
        expect(window.getComputedStyle($('.content')).gridColumn).toBe('2 / 4')
        expect(window.getComputedStyle($('.content')).gridRow).toBe('2 / 2')
        expect(window.getComputedStyle($('footer')).gridColumn).toBe('1 / 4')
        expect(window.getComputedStyle($('footer')).gridRow).toBe('3 / 3')
        expect(window.getComputedStyle($('footer')).padding).toBe("");
    })

    test('CSS should respect highlights and defaults', () => {
        let generatedHtml = app._buildHTMLForQuery(selectors, true, true);
        let css = app._buildStylesForQuery(selectors, true, true);
        document.head.insertAdjacentHTML("beforeend", `<style>${css}</style>`)
        document.body.innerHTML = generatedHtml;
        expect(window.getComputedStyle($('header')).padding.length).toBeGreaterThan(1)
        expect(window.getComputedStyle($('header')).background.length).toBeGreaterThan(1)
    })
    
})

describe('generateTemplateHtml', () => {
    test('holy-grail', () => {
        expect(app._generateTemplateHtml('holy-grail', '.grid-container'))
        .toBeDefined();
    })

    test('2-col', () => {
        expect(app._generateTemplateHtml('2-col', '.grid-container'))
        .toBeDefined();
    })

    test('3-col', () => {
        expect(app._generateTemplateHtml('3-col', '.grid-container'))
        .toBeDefined();
    })

    test('4-col', () => {
        expect(app._generateTemplateHtml('4-col', '.grid-container'))
        .toBeDefined();
    })

    test('2-row', () => {
        expect(app._generateTemplateHtml('2-row', '.grid-container'))
        .toBeDefined();
    })

    test('3-row', () => {
        expect(app._generateTemplateHtml('3-row', '.grid-container'))
        .toBeDefined();
    })

    test('4-row', () => {
        expect(app._generateTemplateHtml('4-row', '.grid-container'))
        .toBeDefined();
    })
})


describe('generateTemplateStyle', () => {
    test('holy-grail', () => {
        expect(app._generateTemplateStyle('holy-grail', '.grid-container'))
        .toBeDefined();
    })


    test('2-col', () => {
        expect(app._generateTemplateStyle('2-col', '.grid-container'))
        .toBeDefined();
    })

    test('3-col', () => {
        expect(app._generateTemplateStyle('3-col', '.grid-container'))
        .toBeDefined();
    })

    test('4-col', () => {
        expect(app._generateTemplateStyle('4-col', '.grid-container'))
        .toBeDefined();
    })

    test('2-row', () => {
        expect(app._generateTemplateStyle('2-row', '.grid-container'))
        .toBeDefined();
    })

    test('3-row', () => {
        expect(app._generateTemplateStyle('3-row', '.grid-container'))
        .toBeDefined();
    })

    test('4-row', () => {
        expect(app._generateTemplateStyle('4-row', '.grid-container'))
        .toBeDefined();
    })
})

describe('getGrid', () => {
    test('should give output for rows and columns', () => {
        let {html, style} = app.getGrid({columns: 2, rows: 2});
        expect(html).toBeDefined();
        expect(style).toBeDefined();
    })

    test('should give output for query', () => {
        let {html, style} = app.getGrid({query: "header/article/footer"});
        expect(html).toBeDefined();
        expect(style).toBeDefined();
    })

    test('should give output for template', () => {
        let {html, style} = app.getGrid({template: "holy-grail"});
        expect(html).toBeDefined();
        expect(style).toBeDefined();
    })

    test('should return only style', () => {
        let {html, style } = app.getGrid({template: "holy-grail", onlyStyle: true});
        expect(html).toBeUndefined();
        expect(style).toBeDefined();
    })

    test('should return only html', () => {
        let {html, style } = app.getGrid({template: "holy-grail", onlyHtml: true});
        expect(html).toBeDefined();
        expect(style).toBeUndefined();
    })

    test('should output both html,css for output=true', () => {
        let {html, style } = app.getGrid({template: "holy-grail", output: true});
        expect(html).toBeDefined();
        expect(style).toBeDefined();
    })

    test('should output only html for output=true', () => {
        let {html, style } = app.getGrid({template: "holy-grail", output: true, onlyHtml: true});
        expect(html).toBeDefined();
        expect(style).toBeUndefined();
    })

    test('should output only css for output=true', () => {
        let {html, style } = app.getGrid({template: "holy-grail", output: true, onlyStyle: true});
        expect(html).toBeUndefined();
        expect(style).toBeDefined();
    })
})