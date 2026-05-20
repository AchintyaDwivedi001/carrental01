"use client";
import React from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

const Map = ({ getSource, getDestination }) => {
  // 🌟 THE TRANSLATION LAYER: Safely convert 'latitude' strings to strict Leaflet number arrays
  const sourceCoord = getSource?.latitude && getSource?.longitude 
    ? [parseFloat(getSource.latitude), parseFloat(getSource.longitude)] 
    : null;

  const destCoord = getDestination?.latitude && getDestination?.longitude 
    ? [parseFloat(getDestination.latitude), parseFloat(getDestination.longitude)] 
    : null;

  // Center on India by default if no source is selected yet
  const defaultCenter = [20.5937, 78.9629]; 

  return (
    <MapContainer
      center={sourceCoord || defaultCenter}
      zoom={sourceCoord ? 10 : 4} // Zoom in tight if we have a city!
      scrollWheelZoom={false}
      className="h-full rounded-lg min-h-[400px] z-0 relative"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {sourceCoord && <Marker position={sourceCoord} />}
      {destCoord && <Marker position={destCoord} />}
    </MapContainer>
  );
};

export default Map;