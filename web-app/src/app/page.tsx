import data from '../data.json';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="container">
      <header className="animate-fade-in">
        <h1>Fiches Techniques</h1>
        <p className="subtitle">
          Découvrez les caractéristiques détaillées des véhicules premium. 
          Performances, dimensions, motorisations : tout ce que vous devez savoir.
        </p>
      </header>

      <div className="grid">
        {data.map((car: any, index: number) => (
          <div 
            key={index} 
            className={`card animate-fade-in delay-${(index % 3) + 1}`}
          >
            <div className="card-header">
              <span className="badge">{car.brand.name} {car.model}</span>
              <h2 className="card-title">{car.name}</h2>
              <div className="card-meta">
                <span>{car.vehicleModelDate}</span>
                <span>•</span>
                <span>{car.bodyType}</span>
                <span>•</span>
                <span>{car.fuelType}</span>
              </div>
            </div>

            <div className="card-body">
              <div className="stat-row">
                <span className="stat-label">Moteur</span>
                <span className="stat-value">{car.vehicleEngine?.name}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Puissance</span>
                <span className="stat-value">{car.vehicleEngine?.enginePower?.value} ch</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Boîte</span>
                <span className="stat-value">{car.vehicleTransmission}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">0-100 km/h</span>
                <span className="stat-value">{car.speed?.value} km/h (Max)</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Consommation</span>
                <span className="stat-value">{car.fuelEfficiency?.value} {car.fuelEfficiency?.unitText}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Émissions CO2</span>
                <span className="stat-value">{car.emissionsCO2} g/km</span>
              </div>
            </div>

            <div className="card-footer">
              <div className="price">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: car.offers?.priceCurrency || 'EUR' }).format(car.offers?.price)}
              </div>
              <Link href={`/car/${index}`} className="btn">
                Voir les détails
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
