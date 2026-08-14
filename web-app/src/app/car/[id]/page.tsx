import data from '../../../data.json';
import Link from 'next/link';

export default async function CarDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const carIndex = parseInt(id, 10);
  const car = data[carIndex];

  if (!car) {
    return (
      <main className="container">
        <h1>Car not found</h1>
        <Link href="/" className="btn">Retour</Link>
      </main>
    );
  }

  const extraDetails = (car as any).extraDetails || {};
  const categories = Object.keys(extraDetails);

  return (
    <main className="container">
      <Link href="/" style={{ color: 'var(--accent-color)', display: 'inline-block', marginBottom: '2rem', fontSize: '1.1rem' }}>
        ← Retour aux modèles
      </Link>
      
      <header className="animate-fade-in">
        <h1>{car.name}</h1>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
           <span className="badge">{car.brand?.name} {car.model}</span>
           <span className="badge">{car.vehicleModelDate}</span>
           <span className="badge">{car.bodyType}</span>
           <span className="badge">{car.fuelType}</span>
        </div>
      </header>

      <div className="grid">
        {categories.map((category, index) => (
          <div key={category} className={`card animate-fade-in delay-${(index % 3) + 1}`}>
            <div className="card-header" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>
              <h2 className="card-title" style={{ fontSize: '1.25rem' }}>{category}</h2>
            </div>
            <div className="card-body">
              {Object.entries(extraDetails[category]).map(([key, value]) => (
                <div key={key} className="stat-row">
                  <span className="stat-label" style={{ flex: '1', paddingRight: '1rem' }}>{key}</span>
                  <span className="stat-value" style={{ flex: '1', textAlign: 'right', color: '#fff' }}>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
