import { useState, useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { useGeolocated } from "react-geolocated";
import "mapbox-gl/dist/mapbox-gl.css";

const INITIAL_CENTER = [-74.0242, 40.6941];
const INITIAL_ZOOM = 11.12;

function TransgressionMap({ transgressions = { features: [] } }) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markersRef = useRef([]);

  const [center, setCenter] = useState(INITIAL_CENTER);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);

  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
      positionOptions: { enableHighAccuracy: false },
      userDecisionTimeout: 5000,
    });

  // Update center from geolocation in an effect (NOT during render)
  useEffect(() => {
    if (isGeolocationAvailable && isGeolocationEnabled && coords) {
      const newCenter = [coords.longitude, coords.latitude];
      // If map already exists, update its viewport without reinitializing
      if (mapRef.current) {
        mapRef.current.setCenter(newCenter);
        mapRef.current.addSource("center", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: newCenter,
                },
              },
            ],
          },
        });
        mapRef.current.addLayer({
          id: "locationOrb",
          type: "circle",
          source: "center",
          paint: { "circle-radius": 8, "circle-color": "#ff0000" },
        });
        mapRef.current.addLayer({
          id: "locationOrbOutline",
          type: "circle",
          source: "center",
          paint: {
            "circle-radius": 12,
            "circle-color": "#ffffff",
            "circle-opacity": 0.5,
          },
        });
      }
    }
  }, [coords, isGeolocationAvailable, isGeolocationEnabled]);

  // Initialize the Mapbox map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center,
      zoom,
    });

    const onMove = () => {
      const mapCenter = mapRef.current.getCenter();
      const mapZoom = mapRef.current.getZoom();
      setCenter([mapCenter.lng, mapCenter.lat]);
      setZoom(mapZoom);
    };

    mapRef.current.on("move", onMove);

    return () => {
      if (mapRef.current) {
        mapRef.current.off("move", onMove);
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Intentionally empty deps: initialize only once

  // Update markers whenever transgressions change
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const features = transgressions?.features || [];
    features.forEach((t) => {
      const coords = t.geometry?.coordinates;
      if (!coords) return;

      // Build a single HTML string for the popup
      // Build a single HTML string for the popup
      const srcURL = import.meta.env.VITE_PHOTOS_URL;
      const photoId = t.properties?.photoIDs;
      // Use hosted photos if configured and photoId present, else fallback to public placeholder
      const placeholderPath = "/images/placeholder.jpg"; // put this file in public/images/
      const imgSrc =
        srcURL && photoId
          ? `${srcURL}/${encodeURIComponent(photoId)}.jpg`
          : placeholderPath;
      const popupHtml = `
        <section>
          <img src="${imgSrc}" alt="Image" style="max-width:200px; display:block; margin-bottom:8px;" />
          <p>${t.properties?.description || ""}</p>
        </section>
      `;

      const marker = new mapboxgl.Marker({ color: "black", rotation: 45 })
        .setLngLat(coords)
        .setPopup(new mapboxgl.Popup().setHTML(popupHtml))
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });
  }, [transgressions]);

  return (
    <div
      id="map-container"
      ref={mapContainerRef}
      style={{ width: "100%", height: "100%" }}
    />
  );
}

export default TransgressionMap;
