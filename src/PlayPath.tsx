import Svg, { Path, Circle } from 'react-native-svg';

type P = { x: number; y: number };
type Props = {
  points: P[];
  color?: string;
  strokeWidth?: number;
  showDots?: boolean;
};

function toPath(points: P[]) {
  if (!points.length) return '';
  const [h, ...t] = points;
  return `M ${h.x} ${h.y} ` + t.map(p => `L ${p.x} ${p.y}`).join(' ');
}

export default function PlayPath({ points, color = '#F59E0B', strokeWidth = 3, showDots = true }: Props) {
  const d = toPath(points);
  return (
    <Svg style={{ position: 'absolute', inset: 0 }}>
      <Path d={d} stroke={color} strokeWidth={strokeWidth} fill="none" />
      {showDots && points.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={color} />
      ))}
    </Svg>
  );
}
