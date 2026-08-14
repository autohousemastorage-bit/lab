import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Define the car structure
export interface Car {
  id: number;
  name: string;
  url: string;
  brand: { name: string };
  model: string;
  vehicleModelDate: string;
  modelDate?: string;
  bodyType: string;
  fuelType: string;
  driveWheelConfiguration?: string;
  vehicleTransmission?: string;
  offers?: { price: number; priceCurrency: string };
  extraDetails?: any;
}

// In-memory cache
let carsCache: Car[] | null = null;
let brandsCache: string[] = [];
let modelsByBrand: Record<string, string[]> = {};
let trimsByModel: Record<string, Record<string, Car[]>> = {}; // brand -> model -> cars

export function loadData() {
  if (carsCache) return;

  console.log('Loading JSONL data into memory...');
  const jsonlPath = path.join(process.cwd(), '../scraper/data.jsonl');
  const gzPath = path.join(process.cwd(), '../scraper/data.jsonl.gz');
  
  let fileContent = '';
  if (fs.existsSync(gzPath)) {
    console.log('Found gzipped data file, decompressing...');
    fileContent = zlib.gunzipSync(fs.readFileSync(gzPath)).toString('utf-8');
  } else if (fs.existsSync(jsonlPath)) {
    console.log('Found uncompressed data file...');
    fileContent = fs.readFileSync(jsonlPath, 'utf-8');
  } else {
    console.error('Data file not found at:', jsonlPath, 'or', gzPath);
    carsCache = [];
    return;
  }

  const lines = fileContent.split('\n');
  
  carsCache = [];
  const brandSet = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const car: Car = JSON.parse(line);
      car.id = i; // Assign line number as unique ID
      carsCache.push(car);

      const brandName = car.brand?.name || 'Unknown';
      const modelName = car.model || 'Unknown';

      brandSet.add(brandName);

      // Map models to brands
      if (!modelsByBrand[brandName]) {
        modelsByBrand[brandName] = [];
      }
      if (!modelsByBrand[brandName].includes(modelName)) {
        modelsByBrand[brandName].push(modelName);
      }

      // Map cars to models
      if (!trimsByModel[brandName]) {
        trimsByModel[brandName] = {};
      }
      if (!trimsByModel[brandName][modelName]) {
        trimsByModel[brandName][modelName] = [];
      }
      trimsByModel[brandName][modelName].push(car);

    } catch (e) {
      console.error(`Failed to parse line ${i}`);
    }
  }

  brandsCache = Array.from(brandSet).sort();
  console.log(`Loaded ${carsCache.length} cars successfully!`);
}

export function getAllBrands(): string[] {
  loadData();
  return brandsCache;
}

export function getModelsForBrand(brand: string): string[] {
  loadData();
  // Decode URL encoded brand names (e.g. "Alfa%20Romeo" -> "Alfa Romeo")
  const decodedBrand = decodeURIComponent(brand);
  const foundBrand = Object.keys(modelsByBrand).find(b => b.toLowerCase() === decodedBrand.toLowerCase());
  return foundBrand ? modelsByBrand[foundBrand].sort() : [];
}

export function getCarsForModel(brand: string, model: string): Car[] {
  loadData();
  const decodedBrand = decodeURIComponent(brand);
  const decodedModel = decodeURIComponent(model);
  
  const foundBrand = Object.keys(trimsByModel).find(b => b.toLowerCase() === decodedBrand.toLowerCase());
  if (!foundBrand) return [];

  const foundModel = Object.keys(trimsByModel[foundBrand]).find(m => m.toLowerCase() === decodedModel.toLowerCase());
  if (!foundModel) return [];

  return trimsByModel[foundBrand][foundModel];
}

export function getCarById(id: number): Car | null {
  loadData();
  return carsCache?.[id] || null;
}
