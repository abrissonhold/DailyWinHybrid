import { MapPickerProps } from "@/types/MapPickerProps";
import React, { useEffect, useRef } from "react";
export default function WebMap({ location, setLocation }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    (async () => {
      const L = await import("leaflet");

      // Fix default marker icons (Leaflet bug in bundlers)
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!).setView([-34.6037, -58.3816], 13);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      let marker: any = null;

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        setLocation(`${lat},${lng}`);

        if (marker) marker.remove();
        marker = L.marker([lat, lng]).addTo(map);
      });

      return () => {
        map.remove();
      };
    })();
  }, []);

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
