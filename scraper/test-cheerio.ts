import * as cheerio from 'cheerio';
import * as fs from 'fs';

const html = fs.readFileSync('/home/rkicy/.gemini/antigravity-ide/brain/dde31fba-a25a-4350-88d5-5360120312b7/.system_generated/steps/122/content.md', 'utf-8');
const $ = cheerio.load(html);

const results: Record<string, any> = {};

$('.ft-section-title, .ft-section-subtitle, .accordion-title').each((i, el) => {
    // Some sections are direct tables, some are inside accordions.
    // Let's just find all table-like structures (usually div rows or table).
});

// The structure seems to be: 
// <div class="table"> 
//    <div class="tr">
//        <div class="th">...</div>
//        <div class="td">...</div>
//    </div>
// </div>
// Let's check for standard tables vs div tables.

const sections: any = {};
let currentSection = 'General';

$('h2, h3, .ft-section-title, .ft-section-subtitle, .accordion-title').each((i, el) => {
    currentSection = $(el).text().trim();
    sections[currentSection] = {};
    
    // find next table
    const table = $(el).nextAll('table, .ft-table').first();
    // actually, let's just grab all rows globally and see their classes
});

// A simpler way: grab all elements that look like a key-value row.
// In largus, it's often `<div class="row">` or similar. Let's dump all text inside ft-section
const dump = [];
$('h2.ft-section-title, h3.ft-section-subtitle, div.ft-table-row, tr').each((i, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (text) dump.push(text);
});

fs.writeFileSync('dump.txt', dump.join('\n'));
console.log('Dumped to dump.txt');
