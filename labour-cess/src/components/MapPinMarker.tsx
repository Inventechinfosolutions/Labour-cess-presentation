import { HEX } from "@/lib/palette";

/** Shared animated location pin for SVG map overlays. */
export function MapPinMarker({
  x,
  y,
  fill,
  label,
  emphasis,
  delay = 0,
  labelColor = HEX.navy,
}: {
  x: number;
  y: number;
  fill: string;
  label?: string;
  emphasis?: boolean;
  delay?: number;
  labelColor?: string;
}) {
  const scale = emphasis ? 1.15 : 1;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cy="-6" r="16" fill={fill} className="pin-ring" style={{ animationDelay: `${delay}ms` }} />
      <circle cy="-6" r="16" fill={fill} className="pin-ring" style={{ animationDelay: `${delay + 650}ms` }} />
      <circle cy="-6" r="22" fill={fill} className="pin-soft" style={{ animationDelay: `${delay}ms` }} />
      <g
        className="pin-bob"
        style={{ animationDelay: `${delay}ms`, transformOrigin: "0px -8px" }}
        transform={emphasis ? `scale(${scale})` : undefined}
      >
        <path
          d="M0-17.5c-6.2 0-11.2 4.9-11.2 11.5 0 8.2 11.2 18.8 11.2 18.8s11.2-10.6 11.2-18.8C11.2-12.6 6.2-17.5 0-17.5z"
          fill={fill}
          stroke="#fff"
          strokeWidth={emphasis ? 1.7 : 1.3}
        />
        <circle cy="-8.2" r="3.8" fill="#fff" />
      </g>
      {label ? (
        <text
          x="12"
          y="-9"
          fill={labelColor}
          fontSize={emphasis ? 9 : 8}
          fontWeight="700"
          style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: 3 }}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}
