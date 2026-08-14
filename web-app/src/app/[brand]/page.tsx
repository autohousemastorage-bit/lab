import { getModelsForBrand } from '@/lib/data';
import Link from 'next/link';

export default async function BrandModels({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  const decodedBrand = decodeURIComponent(brand);
  const models = getModelsForBrand(decodedBrand);

  if (models.length === 0) {
    return (
      <main className="container">
        <h1>Marque non trouvée</h1>
        <Link href="/" className="btn">Retour aux marques</Link>
      </main>
    );
  }

  return (
    <main className="container">
      <Link href="/" style={{ color: 'var(--accent-color)', display: 'inline-block', marginBottom: '2rem', fontSize: '1.1rem' }}>
        ← Retour aux marques
      </Link>
      
      <header className="animate-fade-in">
        <h1 style={{ textTransform: 'capitalize' }}>Modèles {decodedBrand}</h1>
        <p className="subtitle">Sélectionnez un modèle</p>
      </header>

      <div className="grid">
        {models.map((model, index) => (
          <div key={model} className={`card animate-fade-in delay-${(index % 3) + 1}`}>
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100px' }}>
              <h2 className="card-title" style={{ fontSize: '1.5rem', textAlign: 'center' }}>{model}</h2>
            </div>
            
            <div className="card-footer" style={{ justifyContent: 'center' }}>
              <Link href={`/${brand}/${encodeURIComponent(model.toLowerCase())}`} className="btn" style={{ width: '100%', textAlign: 'center' }}>
                Voir les versions
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
