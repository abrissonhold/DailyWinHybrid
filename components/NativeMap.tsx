import { MapPickerProps } from "@/types/MapPickerProps";
import React from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";

export default function NativeMap({ location, setLocation, readOnly = false }: MapPickerProps) {
  const initialCoords = location
    ? {
      latitude: parseFloat(location.split(',')[0]),
      longitude: parseFloat(location.split(',')[1]),
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }
    : {
      latitude: -34.6037,
      longitude: -58.3816,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialCoords}
        onPress={(e) => {
          if (!readOnly && setLocation) {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setLocation(`${latitude},${longitude}`);
          }
        }}
        scrollEnabled={!readOnly}
        zoomEnabled={!readOnly}
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
          maximumZ={20}
        />

        {location && (() => {
          const [lat, lon] = location.split(",").map(Number);
          return <Marker coordinate={{ latitude: lat, longitude: lon }} />;
        })()}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", height: 300, overflow: "hidden" },
  map: { flex: 1 }
});
