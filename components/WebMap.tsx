import { MapPickerProps } from "@/types/MapPickerProps";
import React, { useEffect, useRef } from "react";

export default function WebMap({ location, setLocation, readOnly = false }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    let map: any;
    (async () => {
      const L = await import("leaflet");

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      const initialCoords: [number, number] = location
        ? (location.split(',').map(Number) as [number, number])
        : [-34.6037, -58.3816];

      map = L.map(mapRef.current!).setView(initialCoords, 13);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      let marker: any = null;
      if (location) {
        marker = L.marker(initialCoords).addTo(map);
      }

      if (!readOnly) {
        map.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          if (setLocation) {
            setLocation(`${lat},${lng}`);
          }

          if (marker) marker.remove();
          marker = L.marker([lat, lng]).addTo(map);
        });
      }
    })();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [location, readOnly, setLocation]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: 300,
        borderRadius: 12,
        overflow: "hidden",
      }}
    />
  );
}
