import * as ScreenOrientation from 'expo-screen-orientation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, ImageBackground, StyleSheet, Dimensions, Pressable, Text, Switch, useWindowDimensions } from 'react-native';
import DraggablePiece from './DraggablePiece';
import type { Piece } from './types';

const BASE_W = 1280;
const BASE_H = 720;
const TOOLBAR_H = 60;
const GAP = 12;

const INIT_PIECES: Piece[] = [
  { id: 'A1', label: '1', color: '#3B82F6', x: 1170,  y: 180, size: 50 },
  { id: 'A2', label: '2', color: '#22C55E', x: 1170, y: 280, size: 50 },
  { id: 'A3', label: '3', color: '#F59E0B', x: 1170, y: 380, size: 50 },
  { id: 'A4', label: '4', color: '#A855F7', x: 1170, y: 480, size: 50 },
  { id: 'A5', label: '5', color: '#EF4444', x: 1170, y: 580, size: 50 },
];

const INIT_BALL: Piece[] = [
  { id: 'BALL', label: '🏀', color: '#334155', x: 615, y: 580, size: 50 },
];

const INIT_PIECES_OPPONENT: Piece[] = [
  { id: 'A1', label: 'OP1', color: '#3B82F6',  border: '#EF4444', x: 40,  y: 180, size: 50 },
  { id: 'A2', label: 'OP2', color: '#22C55E',  border: '#EF4444', x: 40, y: 280, size: 50 },
  { id: 'A3', label: 'OP3', color: '#F59E0B',  border: '#EF4444', x: 40, y: 380, size: 50 },
  { id: 'A4', label: 'OP4', color: '#A855F7',  border: '#EF4444', x: 40, y: 480, size: 50 },
  { id: 'A5', label: 'OP5', color: '#EF4444',  border: '#EF4444', x: 40, y: 580, size: 50 }
];

type NPiece = Piece & { nx: number; ny: number };

const toNorm = (p: Piece): NPiece => ({
  ...p,
  nx: (p.x ?? 0) / BASE_W,
  ny: (p.y ?? 0) / BASE_H,
});

const toAbs = (p: NPiece, boardW: number, boardH: number): Piece => ({
  ...p,
  x: p.nx * boardW,
  y: p.ny * boardH,
});


export default function CourtBoard() {
  const { width, height } = useWindowDimensions();
  const BOARD_RATIO = 16 / 9;
  const idealBoardH = width / BOARD_RATIO;

  const BOARD_H = Math.min(idealBoardH, height - TOOLBAR_H - GAP - 16); // -16 กัน safe area เล็กน้อย
  const BOARD_W = BOARD_H * BOARD_RATIO;

  const [pieces, setPieces] = useState<NPiece[]>(INIT_PIECES.map(toNorm));
  const [piecesOpponent, setPiecesOpponent] = useState<NPiece[]>(INIT_PIECES_OPPONENT.map(toNorm));
  const [ball, setBall] = useState<NPiece[]>(INIT_BALL.map(toNorm));

  const [activePathId, setActivePathId] = useState<string | null>(null);
  const [isHideOp, setHideOp] = useState<boolean>(false);
  const [rev, setRev] = useState(0);
  const grid = 12;

  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const clampNorm = useCallback((p: NPiece): NPiece => {
    const SIZE = p.size ?? 36;
    const maxNx = (BOARD_W - SIZE) / BOARD_W;
    const maxNy = (BOARD_H - SIZE) / BOARD_H;
    return {
      ...p,
      nx: Math.max(0, Math.min(p.nx, Math.max(0, maxNx))),
      ny: Math.max(0, Math.min(p.ny, Math.max(0, maxNy))),
    };
  }, [BOARD_W, BOARD_H]);
  const onMove = useCallback((id: string, x: number, y: number) => {
    setPieces(prev =>
      prev.map(p => (p.id === id
        ? clampNorm({ ...p, nx: x / BOARD_W, ny: y / BOARD_H })
        : p
      ))
    );
  }, [BOARD_W, BOARD_H, clampNorm]);

  const onMoveOpponent = useCallback((id: string, x: number, y: number) => {
    setPiecesOpponent(prev =>
      prev.map(p => (p.id === id
        ? clampNorm({ ...p, nx: x / BOARD_W, ny: y / BOARD_H })
        : p
      ))
    );
  }, [BOARD_W, BOARD_H, clampNorm]);

  const onMoveBall = useCallback((id: string, x: number, y: number) => {
    setBall(prev =>
      prev.map(p => (p.id === id
        ? clampNorm({ ...p, nx: x / BOARD_W, ny: y / BOARD_H })
        : p
      ))
    );
  }, [BOARD_W, BOARD_H, clampNorm]);

  const freshAttackers = () => INIT_PIECES.map(toNorm).map(clampNorm);
  const freshOpponents = () => INIT_PIECES_OPPONENT.map(toNorm).map(clampNorm);
  const freshBall = () => INIT_BALL.map(toNorm).map(clampNorm);

  const resetAll = () => {
    setPieces(freshAttackers());
    setPiecesOpponent(freshOpponents());
    setBall(freshBall());
    setRev(r => r + 1);
  };

  const resetPositions = () => {
    setPieces(freshAttackers());
    setBall(freshBall());
    setRev(r => r + 1);
  };

  const resetPositionsOpponent = () => {
    setPiecesOpponent(freshOpponents());
    setRev(r => r + 1);
  };

  const boardRef = useRef<View>(null);

  const piecesAbs = useMemo(() => pieces.map(p => toAbs(p, BOARD_W, BOARD_H)), [pieces, BOARD_W, BOARD_H]);
  const piecesOpponentAbs = useMemo(() => piecesOpponent.map(p => toAbs(p, BOARD_W, BOARD_H)), [piecesOpponent, BOARD_W, BOARD_H]);
  const ballAbs = useMemo(() => ball.map(p => toAbs(p, BOARD_W, BOARD_H)), [ball, BOARD_W, BOARD_H]);
  return (
    <View style={styles.wrap}>
      <View style={[styles.board, { width: BOARD_W, height: BOARD_H }]} ref={boardRef}>
        <ImageBackground source={require('../assets/court_half.png')} style={StyleSheet.absoluteFill} resizeMode="contain" />

        {(isEnabled ? piecesAbs.slice(0, 3) : piecesAbs).map(p => (
          <DraggablePiece
            key={`atk-${p.id}-${rev}`}
            piece={p}
            boardW={BOARD_W}
            boardH={BOARD_H}
            grid={grid}
            onMove={onMove}
            draggable={p.id.startsWith('A') || p.id === 'BALL'}
          />
        ))}
        {ballAbs.map(p => (
          <DraggablePiece
            key={`ball-${p.id}-${rev}`}
            piece={p}
            boardW={BOARD_W}
            boardH={BOARD_H}
            grid={grid}
            onMove={onMoveBall}
            draggable={p.id.startsWith('A') || p.id === 'BALL'}
          />
        ))}
        {!isHideOp && (isEnabled ? piecesOpponentAbs.slice(0, 3) : piecesOpponentAbs).map(p => (
          <DraggablePiece
            key={`op-${p.id}-${rev}`}
            piece={p}
            boardW={BOARD_W}
            boardH={BOARD_H}
            grid={grid}
            onMove={onMoveOpponent}
            draggable={p.id.startsWith('A')}
          />
        ))}
      </View>

      <View style={[styles.toolbar, { height: TOOLBAR_H }]}>
        <Text style={styles.text}>
          5v5
        </Text>
        <Switch
          trackColor={{false: '#f72f2fff', true: '#97e68dff'}}
          thumbColor={isEnabled ? '#19d400ff' : '#f70505ff'}
          ios_backgroundColor="#e02c2cff"
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
        <Text style={styles.text}>
          3x3
        </Text>
        <ToolBtn label="Reset All" onPress={resetAll} />
        <ToolBtn label="Reset" onPress={resetPositions} />
        <ToolBtn 
          label={isHideOp ? 'Show Opponent' : 'Hide Opponent'}
          onPress={() => setHideOp(!isHideOp)} />
        { !isHideOp && <ToolBtn label="Reset Opponent" onPress={resetPositionsOpponent} />}
      </View>
    </View>
  );
}

function ToolBtn({ label, onPress, color = '#334155' }: { label: string; onPress: () => void; color?: string }) {
  return (
    <Pressable onPress={onPress} android_ripple={{ color: '#ffffff22' }} style={[styles.btn, { backgroundColor: color }]}>
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, height: '100%' },
  board: { backgroundColor: '#0F172A', borderRadius: 12, overflow: 'hidden', height: '100%' },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', paddingHorizontal: 12, alignItems: 'center' },
  text: { justifyContent: 'center', paddingHorizontal: 12, color: '#fff', fontWeight: '700', fontSize: 20},
  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '600' },
});
