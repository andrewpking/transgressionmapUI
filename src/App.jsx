import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { useGeolocated } from "react-geolocated";
import loadTransgressions from "./componenents/loadData";
// import getToken from "./componenents/getToken";
import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";

function App() {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: false,
      },
      userDecisionTimeout: 5000,
    });

  // Determine center coordinates based on geolocation availability and coords
  let center;
  if (isGeolocationAvailable && isGeolocationEnabled && coords) {
    center = [coords.longitude, coords.latitude];
  } else {
    center = [-74.0242, 40.6941]; // Fixed fallback point
  }

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: center,
      zoom: 11.12,
    });

    loadTransgressions().then((data) => {
      const transgressions = data;
      // Add transgressions to map
      transgressions.features.forEach((transgression) => {
        console.log(transgression);
        new mapboxgl.Marker({ color: "black", rotation: 45 })
          .setLngLat(transgression.geometry.coordinates)
          .setPopup(
            new mapboxgl.Popup()
              .setHTML(
                `<img src="https://example.com/${transgression.properties.photoIDs}.jpg" alt="Image" />`,
                `<p>${transgression.properties.description}</p>`,
              )
              .setText(`${transgression.properties.description}`), // TODO: Add image from server
          )
          .addTo(mapRef.current);
      });
    });

    return () => mapRef.current.remove();
  }, [center]);

  return (
    <>
      <div id="map-container" ref={mapContainerRef} />
    </>
  );
}

export default App;
