"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const BASE_URL = 'https://www.largus.fr';
async function fetchPage(url) {
    try {
        const response = await axios_1.default.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
            }
        });
        return response.data;
    }
    catch (error) {
        console.error(`Error fetching ${url}:`, error);
        return null;
    }
}
function extractJsonLd(html) {
    const $ = cheerio.load(html);
    let jsonLdData = null;
    $('script[type="application/ld+json"]').each((i, el) => {
        try {
            const data = JSON.parse($(el).html() || '{}');
            const graph = data['@graph'] || (Array.isArray(data) ? data : [data]);
            for (const item of graph) {
                if (item['@type'] === 'ItemList' || item['@type'] === 'Car') {
                    jsonLdData = item;
                }
            }
        }
        catch (e) {
            // Ignore parse errors
        }
    });
    return jsonLdData;
}
async function scrapeBrands() {
    console.log('Fetching brands...');
    const html = await fetchPage(`${BASE_URL}/fiche-technique.html`);
    if (!html)
        return [];
    const jsonLd = extractJsonLd(html);
    if (jsonLd && jsonLd.itemListElement) {
        return jsonLd.itemListElement.map((item) => ({
            name: item.name,
            url: item.url
        }));
    }
    return [];
}
async function scrapeModels(brandUrl) {
    console.log(`Fetching models for ${brandUrl}...`);
    const html = await fetchPage(brandUrl);
    if (!html)
        return [];
    const jsonLd = extractJsonLd(html);
    if (jsonLd && jsonLd.itemListElement) {
        return jsonLd.itemListElement.map((item) => ({
            name: item.name,
            url: item.url
        }));
    }
    return [];
}
async function run() {
    const brands = await scrapeBrands();
    console.log(`Found ${brands.length} brands.`);
    if (brands.length > 0) {
        // Find Audi for testing
        const audi = brands.find((b) => b.name === 'AUDI');
        if (audi) {
            console.log('Audi URL:', audi.url);
            const models = await scrapeModels(audi.url);
            console.log(`Found ${models.length} models for Audi.`);
            console.log(models.slice(0, 5));
        }
    }
}
run();
//# sourceMappingURL=index.js.map