import { getCarsForModel } from '@/lib/data';
import Link from 'next/link';

export default async function ModelTrims({ params }: { params: Promise<{ brand: string, model: string }> }) {
  const { brand, model } = await params;
  const decodedBrand = decodeURIComponent(brand);
  const decodedModel = decodeURIComponent(model);
  
  const cars = getCarsForModel(decodedBrand, decodedModel);

  if (cars.length === 0) {
    return (
      <main className="container">
        <h1>Modèle non trouvé</h1>
        <Link href={`/${brand}`} className="btn">Retour aux modèles</Link>
      </main>
    );
  }

  return (
    <main className="container">
      <Link href={`/${brand}`} style={{ color: 'var(--accent-color)', display: 'inline-block', marginBottom: '2rem', fontSize: '1.1rem' }}>
        ← Retour aux modèles {decodedBrand}
      </Link>
      
      <header className="animate-fade-in">
        <h1 style={{ textTransform: 'capitalize' }}>{decodedBrand} {decodedModel}</h1>
        <p className="subtitle">{cars.length} versions disponibles</p>
      </header>

      <div className="grid">
        {cars.map((car, index) => (
          <div key={car.id} className={`card animate-fade-in delay-${(index % 3) + 1}`}>
            <div className="card-header">
              <h2 className="card-title">{car.name}</h2>
              <span className="badge">{car.vehicleModelDate || car.modelDate}</span>
            </div>
            
            <div className="card-body">
              <div className="stat-row">
                <span className="stat-label">Carrosserie</span>
                <span className="stat-value">{car.bodyType}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Énergie</span>
                <span className="stat-value">{car.fuelType}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Boîte</span>
                <span className="stat-value">{car.vehicleTransmission || 'N/A'}</span>
              </div>
            </div>

            <div className="card-footer">
              <div className="price">
                {car.offers?.price ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: car.offers.priceCurrency || 'EUR' }).format(car.offers.price) : 'N/A'}
              </div>
              <Link href={`/car/${car.id}`} className="btn">
                Voir les détails
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
