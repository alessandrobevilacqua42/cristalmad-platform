const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'style.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

// Find duplicate selectors
const selectors = {};
const duplicates = [];

const rules = cssContent.split('}');
rules.forEach(rule => {
    if (!rule.trim()) return;
    const parts = rule.split('{');
    if (parts.length === 2) {
        const selector = parts[0].trim();
        if (selector.startsWith('@') || selector.startsWith(':root')) return;

        // Clean up selector for comparison
        const cleanedSelector = selector.replace(/\s+/g, ' ');
        if (selectors[cleanedSelector]) {
            duplicates.push(cleanedSelector);
        } else {
            selectors[cleanedSelector] = true;
        }
    }
});

if (duplicates.length > 0) {
    console.log("Duplicate Selectors Found:");
    console.log(duplicates.join('\n'));
} else {
    console.log("No duplicate CSS selectors found.");
}

// Find CSS classes not used in any JS or HTML file
const srcFiles = fs.readdirSync(__dirname).filter(f => f.endsWith('.js') || f.endsWith('.html'));
const viewsFiles = fs.readdirSync(path.join(__dirname, 'views')).filter(f => f.endsWith('.js'));

let allText = '';
srcFiles.forEach(f => allText += fs.readFileSync(path.join(__dirname, f), 'utf8') + '\n');
viewsFiles.forEach(f => allText += fs.readFileSync(path.join(__dirname, 'views', f), 'utf8') + '\n');
const indexHtmlPath = path.join(__dirname, '..', 'index.html');
if (fs.existsSync(indexHtmlPath)) {
    allText += fs.readFileSync(indexHtmlPath, 'utf8');
}

const unusedClasses = [];
Object.keys(selectors).forEach(sel => {
    // Basic class extraction
    const classMatch = sel.match(/\.([a-zA-Z0-9_-]+)/g);
    if (classMatch) {
        classMatch.forEach(cls => {
            const className = cls.substring(1);
            if (!allText.includes(className)) {
                if (!unusedClasses.includes(className)) {
                    // Ignore generalized classes or pseudo classes
                    if (!className.includes(':') && !className.includes(' ')) {
                        unusedClasses.push(className);
                    }
                }
            }
        });
    }
});

console.log("\nPotentially Unused Classes:");
console.log(unusedClasses.join('\n'));
