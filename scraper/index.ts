import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://www.largus.fr';
const DATA_FILE = path.join(__dirname, 'data.jsonl');
const PROGRESS_FILE = path.join(__dirname, 'progress.json');
const ERROR_LOG = path.join(__dirname, 'error.log');

const DELAY_MS = 1500; // 1.5 seconds delay

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

function loadProgress() {
    if (fs.existsSync(PROGRESS_FILE)) {
        return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    }
    return { brandIndex: 0, modelIndex: 0, yearIndex: 0, versionIndex: 0 };
}

function saveProgress(progress: any) {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function logError(message: string) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(ERROR_LOG, `[${timestamp}] ${message}\n`);
}

async function fetchPage(url: string, retries = 3): Promise<string | null> {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`[GET] ${url}`);
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
                },
                timeout: 10000 // 10s timeout
            });
            return response.data;
        } catch (error: any) {
            console.error(`Error fetching ${url} (Attempt ${i + 1}/${retries}):`, error.message);
            if (error.response?.status === 404) {
                return null; // Don't retry 404
            }
            if (i === retries - 1) {
                logError(`Failed to fetch ${url} after ${retries} attempts: ${error.message}`);
                return null;
            }
            await delay(5000); // Wait 5s before retry
        }
    }
    return null;
}

function extractJsonLd(html: string) {
    const $ = cheerio.load(html);
    let results: any[] = [];
    
    $('script[type="application/ld+json"]').each((i, el) => {
        try {
            const data = JSON.parse($(el).html() || '{}');
            const graph = data['@graph'] || (Array.isArray(data) ? data : [data]);
            for (const item of graph) {
                if (item['@type'] === 'ItemList' || item['@type'] === 'Car') {
                    results.push(item);
                }
            }
        } catch (e) {}
    });
    
    return results;
}

function extractExtraDetails(html: string) {
    const $ = cheerio.load(html);
    const details: any = {};
    let currentCategory = 'General';

    $('h2, h3, .ft-section-title, .ft-section-subtitle, .accordion-title, tr').each((i, el) => {
        const tagName = el.tagName.toLowerCase();
        
        if (tagName === 'tr') {
            const $tds = $(el).find('td, th');
            if ($tds.length === 2) {
                const key = $($tds[0]).text().replace(/\s+/g, ' ').trim();
                const value = $($tds[1]).text().replace(/\s+/g, ' ').trim();
                
                if (key && value) {
                    if (!details[currentCategory]) {
                        details[currentCategory] = {};
                    }
                    details[currentCategory][key] = value;
                }
            }
        } else {
            const text = $(el).text().replace(/\s+/g, ' ').trim();
            if (text) {
                currentCategory = text;
            }
        }
    });
    
    return details;
}

async function scrapeList(url: string) {
    const html = await fetchPage(url);
    if (!html) return [];
    
    const items = extractJsonLd(html);
    const itemList = items.find(i => i['@type'] === 'ItemList');
    
    if (itemList && itemList.itemListElement) {
        return itemList.itemListElement.map((item: any) => ({
            name: item.name,
            url: item.url
        }));
    }
    return [];
}

async function scrapeCarDetails(url: string) {
    const html = await fetchPage(url);
    if (!html) return null;
    
    const items = extractJsonLd(html);
    const carData = items.find(i => i['@type'] === 'Car');
    
    if (carData) {
        carData.extraDetails = extractExtraDetails(html);
    }
    
    return carData;
}

async function run() {
    console.log('Starting full robust scraper...');
    
    // 5 hours = 5 * 60 * 60 * 1000 = 18,000,000 ms
    const MAX_RUNTIME_MS = 5 * 60 * 60 * 1000;
    const startTime = Date.now();
    
    let progress = loadProgress();
    console.log(`Resuming from Brand: ${progress.brandIndex}, Model: ${progress.modelIndex}, Year: ${progress.yearIndex}, Version: ${progress.versionIndex}`);

    const brands = await scrapeList(`${BASE_URL}/fiche-technique.html`);
    console.log(`Found ${brands.length} brands.`);

    for (let b = progress.brandIndex; b < brands.length; b++) {
        const brand = brands[b];
        console.log(`\n--- Scraping Brand: ${brand.name} ---`);
        await delay(DELAY_MS);
        
        const models = await scrapeList(brand.url);
        
        for (let m = (b === progress.brandIndex ? progress.modelIndex : 0); m < models.length; m++) {
            const model = models[m];
            console.log(`Scraping Model: ${model.name}`);
            await delay(DELAY_MS);
            
            const years = await scrapeList(model.url);
            
            for (let y = (b === progress.brandIndex && m === progress.modelIndex ? progress.yearIndex : 0); y < years.length; y++) {
                const year = years[y];
                console.log(`Scraping Year: ${year.name}`);
                await delay(DELAY_MS);
                
                const versions = await scrapeList(year.url);
                
                let startVersion = 0;
                if (b === progress.brandIndex && m === progress.modelIndex && y === progress.yearIndex) {
                    startVersion = progress.versionIndex;
                }

                for (let v = startVersion; v < versions.length; v++) {
                    // Check if we exceed 5 hours runtime
                    if (Date.now() - startTime > MAX_RUNTIME_MS) {
                        console.log('Reached 5 hours runtime. Stopping gracefully to allow GitHub Action to commit progress.');
                        process.exit(0);
                    }

                    const version = versions[v];
                    await delay(DELAY_MS);
                    const carDetails = await scrapeCarDetails(version.url);
                    
                    if (carDetails) {
                        // Append to JSONL
                        fs.appendFileSync(DATA_FILE, JSON.stringify(carDetails) + '\n');
                    }

                    // Update and save progress after each successful car
                    progress = { brandIndex: b, modelIndex: m, yearIndex: y, versionIndex: v + 1 };
                    saveProgress(progress);
                }
                
                // Reset version index for next year
                progress = { brandIndex: b, modelIndex: m, yearIndex: y + 1, versionIndex: 0 };
                saveProgress(progress);
            }
            
            // Reset year index for next model
            progress = { brandIndex: b, modelIndex: m + 1, yearIndex: 0, versionIndex: 0 };
            saveProgress(progress);
        }
        
        // Reset model index for next brand
        progress = { brandIndex: b + 1, modelIndex: 0, yearIndex: 0, versionIndex: 0 };
        saveProgress(progress);
    }
    
    console.log('\n✅ Scrape completed successfully!');
    // Output a special flag file so GitHub Action knows it's fully done
    fs.writeFileSync(path.join(__dirname, 'DONE'), 'done');
}

run();
