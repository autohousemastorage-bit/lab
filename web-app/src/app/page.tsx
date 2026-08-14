import { getAllBrands } from '@/lib/data';
import Link from 'next/link';

export default function Home() {
  const brands = getAllBrands();

  return (
    <main className="container">
      <header className="animate-fade-in">
        <h1>Marques Automobiles</h1>
        <p className="subtitle">Choisissez une marque pour consulter ses fiches techniques</p>
      </header>

      <div className="grid">
        {brands.map((brand, index) => (
          <div key={brand} className={`card animate-fade-in delay-${(index % 3) + 1}`}>
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '120px' }}>
              <h2 className="card-title" style={{ fontSize: '2rem', textAlign: 'center' }}>{brand}</h2>
            </div>
            
            <div className="card-footer" style={{ justifyContent: 'center' }}>
              <Link href={`/${encodeURIComponent(brand.toLowerCase())}`} className="btn" style={{ width: '100%', textAlign: 'center' }}>
                Voir les modèles
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
