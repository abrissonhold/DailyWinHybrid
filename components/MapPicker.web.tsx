import { MapPickerProps } from "@/types/MapPickerProps";
import React from "react";
import WebMap from "./WebMap";

export default function MapPicker(props: MapPickerProps) {
  return <WebMap {...props} />;
}
