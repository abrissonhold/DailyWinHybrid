import { MapPickerProps } from "@/types/MapPickerProps";
import React from "react";
import NativeMap from "./NativeMap";

export default function MapPicker(props: MapPickerProps) {
  return <NativeMap {...props} />;
}
