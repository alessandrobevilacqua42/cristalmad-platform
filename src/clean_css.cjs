const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'style.css');
let css = fs.readFileSync(cssPath, 'utf8');

const unusedClasses = [
    'contact-section', 'contact__grid', 'contact__info', 'contact__info-card',
    'contact__info-icon', 'contact__social-links', 'contact-map', 'contact__form',
    'atelier-hero', 'atelier-hero__bg', 'atelier-hero__overlay', 'atelier-hero__caustics',
    'atelier-hero__content', 'atelier-hero__title', 'atelier-hero__subtitle', 'atelier-story',
    'atelier-story__grid', 'atelier-story__para', 'atelier-story__numbers', 'atelier-number',
    'atelier-number__value', 'atelier-number__label', 'atelier-story__img-wrapper',
    'atelier-story__img-glow', 'atelier-fornace', 'fornace__grid', 'fornace__card',
    'fornace__card-icon', 'fornace__card-title', 'fornace__card-detail', 'fornace__card-stat',
    'fornace__card-label', 'atelier-team', 'team__grid', 'team__member', 'team__avatar',
    'team__name', 'team__role', 'team__bio', 'atelier-cta', 'atelier-cta__inner',
    'contatti-hero', 'contatti-hero__title', 'contatti-hero__subtitle', 'contatti-map-section',
    'contatti-map', 'contatti-map__frame', 'contatti-map__overlay', 'contatti-map__pin',
    'contatti-map__badge', 'contatti-grid-section', 'contatti-grid', 'contatti-form__header',
    'contatti-form__title', 'contatti-form__desc', 'contatti-form', 'contatti-form__row',
    'contatti-form__field', 'contatti-info', 'contatti-info__card', 'contatti-info__icon',
    'contatti-info__link', 'contatti-info__meta', 'contatti-info__card--cta', 'contatti-social',
    'contatti-social__link'
];

// We'll use a regex to match CSS rules that contain any of the unused classes.
// Note: This regex assumes well-formatted CSS (like what Prettier outputs).
let removedCount = 0;

for (const cls of unusedClasses) {
    // Regex: Match .className followed by anything up to { then anything up to }
    // Handles pseudo-classes and descendent selectors if .className is part of it.
    // Example: .atelier-hero { ... } or .atelier-hero__bg img { ... }

    // We need to carefully balance braces. Since there are no nested braces in standard CSS 
    // outside of media queries (which our old view css didn't heavily use for these),
    // a simple regex works for top-level rules.

    const regex = new RegExp(`\\.${cls}(::?[a-zA-Z-]+)?(\\s+[^\\{]*)?\\s*\\{[^\\}]*\\}`, 'g');

    css = css.replace(regex, (match) => {
        removedCount++;
        return '';
    });

    // Also remove media queries that might enclose ONLY that class exactly (simple heuristic)
    // Actually, it's safer to just run prettier again after this.
}

// Remove empty media queries left behind
css = css.replace(/@media[^{]+\{\s*\}/g, '');

// Clean up completely empty lines that are more than 2
css = css.replace(/\n\s*\n\s*\n/g, '\n\n');

fs.writeFileSync(cssPath, css);
console.log(`Cleaned up! Removed ${removedCount} unused CSS rules/blocks.`);
