import React from "react";

/** Label di atas bar Plan/Actual — gaya selaras SS PlanActualBarValueLabel */
export function GroupedBarTopLabel(props: {
  x?: number;
  y?: number;
  width?: number;
  value?: number | string;
  fill: string;
  offsetY?: number;
  fontSize?: number;
}) {
  const { x = 0, y = 0, width = 0, value, fill, offsetY = 0, fontSize = 14 } = props;
  if (value == null || value === "") return null;

  const topOffset = fontSize + 2;

  return (
    <text
      x={x + width / 2}
      y={y - topOffset + offsetY}
      fill={fill}
      fontSize={fontSize}
      fontWeight={fontSize >= 20 ? "800" : "700"}
      textAnchor="middle"
    >
      {value}
    </text>
  );
}
