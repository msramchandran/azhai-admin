import { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, MarkerF, InfoWindow } from '@react-google-maps/api';
import api from '../services/api';
import autoIcon from '../assets/auto-icon.png';

const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '8px',
};

const defaultCenter = {
  lat: 12.9500,
  lng: 80.1000,
};

const mapBounds = {
  north: 13.2,
  south: 12.6,
  east: 80.4,
  west: 79.7,
};

const mockLiveDrivers = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    autoVariant: 'Compact Auto',
    lat: 12.9716,
    lng: 79.8711,
  },
  {
    id: 2,
    name: 'Priya Sharma',
    autoVariant: 'Maxima Auto',
    lat: 12.9352,
    lng: 80.2137,
  },
  {
    id: 3,
    name: 'Arjun Patel',
    autoVariant: 'XL Auto',
    lat: 12.8329,
    lng: 80.0192,
  },
];

export default function LiveMap() {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);



  useEffect(() => {
    const fetchLiveDrivers = async () => {
      try {
        const response = await api.get('/api/admin/live-drivers');
        setDrivers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch live drivers:', error);
        setLoading(false);
      }
    };

    fetchLiveDrivers();
    const interval = setInterval(fetchLiveDrivers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMapDragEnd = (map) => {
    const currentBounds = map.getBounds();
    const ne = currentBounds.getNorthEast();
    const sw = currentBounds.getSouthWest();

    if (
      ne.lat() > mapBounds.north ||
      sw.lat() < mapBounds.south ||
      ne.lng() > mapBounds.east ||
      sw.lng() < mapBounds.west
    ) {
      map.fitBounds({
        north: mapBounds.north,
        south: mapBounds.south,
        east: mapBounds.east,
        west: mapBounds.west,
      });
    }
  };

  if (loading) {
    return (
      <div className="ml-64 p-8 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-64 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Live Map Tracking</h1>
        <p className="text-gray-600">Real-time location of active auto-rickshaws in Chennai region</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={defaultCenter}
                zoom={9}
                onLoad={() => setMapLoaded(true)}
                onDragEnd={(map) => handleMapDragEnd(map)}
                options={{
                  restriction: {
                    latLngBounds: mapBounds,
                    strictBounds: true,
                  },
                }}
              >
                {mapLoaded && drivers.map((driver) => (
                  <MarkerF
                    key={driver.id}
                    position={{ lat: driver.lat, lng: driver.lng }}
                    onClick={() => setSelectedDriver(driver)}
                    icon={{
                      url: autoIcon,
                      scaledSize: new window.google.maps.Size(38, 50),
                      anchor: new window.google.maps.Point(19, 25),
                    }}
                  />
                ))}

                {selectedDriver && (
                  <InfoWindow
                    position={{ lat: selectedDriver.lat, lng: selectedDriver.lng }}
                    onCloseClick={() => setSelectedDriver(null)}
                  >
                    <div className="p-3">
                      <p className="font-semibold text-gray-900">{selectedDriver.name}</p>
                      <p className="text-sm text-gray-600">{selectedDriver.autoVariant}</p>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </LoadScript>
          </div>
        </div>

        {/* Driver List Sidebar */}
        <div className="bg-white rounded-lg shadow-md p-4 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Active Drivers ({drivers.length})</h2>
          <div className="space-y-2">
            {drivers.map((driver) => (
              <div
                key={driver.id}
                onClick={() => setSelectedDriver(driver)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedDriver?.id === driver.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                }`}
              >
                <p className="font-semibold">{driver.name}</p>
                <p className={`text-sm ${selectedDriver?.id === driver.id ? 'text-blue-100' : 'text-gray-600'}`}>
                  {driver.autoVariant}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}