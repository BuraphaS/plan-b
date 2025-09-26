import { useEffect, useMemo, useRef } from 'react';
import { Text, StyleSheet, PanResponder, Animated } from 'react-native';
import type { Piece } from './types';

type Props = {
  piece: Piece;
  boardW: number;
  boardH: number;
  grid?: number;
  onMove: (id: string, x: number, y: number) => void;
  draggable?: boolean;
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max));
const snap = (v: number, g: number) => (g && g > 0 ? Math.round(v / g) * g : v);
const isFiniteNum = (n: any) => typeof n === 'number' && isFinite(n);

export default function DraggablePiece({
  piece,
  boardW,
  boardH,
  grid = 0,
  onMove,
  draggable = true,
}: Props) {
  const SIZE = piece.size ?? 36;
  const radius = SIZE / 2;
  const pan = useRef(new Animated.ValueXY({ x: piece.x, y: piece.y })).current;

  const curr = useRef({ x: piece.x, y: piece.y });
  useEffect(() => {
    const subId = pan.addListener((v) => {
      curr.current = v;
    });
    return () => pan.removeListener(subId);
  }, [pan]);

  const style = useMemo(
    () => [
      styles.badge,
      {
        width: SIZE,
        height: SIZE,
        borderRadius: radius,
        backgroundColor: piece.color,
        borderColor: piece.border,
        transform: [{ translateX: pan.x }, { translateY: pan.y }],
      },
    ],
    [SIZE, radius, piece.color, pan.x, pan.y]
  );

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => draggable,
        onMoveShouldSetPanResponder: () => draggable,
        onPanResponderGrant: () => {
          pan.extractOffset();
        },
        onPanResponderMove: Animated.event(
          [null, { dx: pan.x, dy: pan.y }],
          { useNativeDriver: false }
        ),
        onPanResponderRelease: () => {
          pan.flattenOffset();

          let finalX = curr.current.x;
          let finalY = curr.current.y;

          finalX = snap(finalX, grid);
          finalY = snap(finalY, grid);

          if (isFiniteNum(boardW) && isFiniteNum(boardH)) {
            const maxX = Math.max(0, boardW - SIZE);
            const maxY = Math.max(0, boardH - SIZE);
            finalX = clamp(finalX, 0, maxX);
            finalY = clamp(finalY, 0, maxY);
          }

          pan.setValue({ x: finalX, y: finalY });
          onMove(piece.id, finalX, finalY);
        },
      }),
    [draggable, pan, boardW, boardH, SIZE, grid, onMove, piece.id]
  );

  return (
    <Animated.View {...responder.panHandlers} style={style}>
      <Text style={styles.label}>{piece.label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  label: { color: '#fff', fontWeight: '700' },
});
