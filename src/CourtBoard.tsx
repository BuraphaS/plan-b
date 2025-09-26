import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, ImageBackground, StyleSheet, Dimensions, Pressable, Text, Switch } from 'react-native';
import DraggablePiece from './DraggablePiece';
import type { Piece } from './types';

const { width } = Dimensions.get('window');
const BOARD_RATIO = 16 / 9;
const BOARD_W = width;
const BOARD_H = width / BOARD_RATIO;

const INIT_PIECES: Piece[] = [
  { id: 'A1', label: '1', color: '#3B82F6', x: 670,  y: 580 },
  { id: 'A2', label: '2', color: '#22C55E', x: 770, y: 580 },
  { id: 'A3', label: '3', color: '#F59E0B', x: 870, y: 580 },
  { id: 'A4', label: '4', color: '#A855F7', x: 970, y: 580 },
  { id: 'A5', label: '5', color: '#EF4444', x: 1070, y: 580 },
];

const INIT_BALL: Piece[] = [
  { id: 'BALL', label: '🏀', color: '#334155', x: 550, y: 580, size: 30 },
];

const INIT_PIECES_OPPONENT: Piece[] = [
  { id: 'A1', label: 'OP1', color: '#3B82F6',  border: '#EF4444', x: 20,  y: 580 },
  { id: 'A2', label: 'OP2', color: '#22C55E',  border: '#EF4444', x: 120, y: 580 },
  { id: 'A3', label: 'OP3', color: '#F59E0B',  border: '#EF4444', x: 220, y: 580 },
  { id: 'A4', label: 'OP4', color: '#A855F7',  border: '#EF4444', x: 320, y: 580 },
  { id: 'A5', label: 'OP5', color: '#EF4444',  border: '#EF4444', x: 420, y: 580 }
];


export default function CourtBoard() {
  const [pieces, setPieces] = useState<Piece[]>(INIT_PIECES);
  const [piecesOpponent, setPiecesOpponent] = useState<Piece[]>(INIT_PIECES_OPPONENT);
  const [ball, setBall] = useState<Piece[]>(INIT_BALL);
  const [activePathId, setActivePathId] = useState<string | null>(null);
  const [isHideOp, setHideOp] = useState<boolean>(false);
  const [rev, setRev] = useState(0);
  const grid = 12;

  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  useEffect(() => {
    (async () => {
    })();
  }, []);

  const onMove = useCallback((id: string, x: number, y: number) => {
    setPieces(prev => prev.map(p => (p.id === id ? { ...p, x, y } : p)));
  }, []);

  const onMoveOpponent = useCallback((id: string, x: number, y: number) => {
    setPiecesOpponent(prev => prev.map(p => (p.id === id ? { ...p, x, y } : p)));
  }, []);

  const onMoveBall = useCallback((id: string, x: number, y: number) => {
    setBall(prev => prev.map(p => (p.id === id ? { ...p, x, y } : p)));
  }, []);

  const clampPiece = (p: Piece): Piece => {
  const SIZE = p.size ?? 36;
    return {
      ...p,
      x: Math.max(0, Math.min(p.x, BOARD_W - SIZE)),
      y: Math.max(0, Math.min(p.y, BOARD_H - SIZE)),
    };
  };
  const clone = (arr: Piece[]) => arr.map(p => ({ ...p }));
  const freshAttackers = () => INIT_PIECES.map(p => clampPiece({ ...p }));
  const freshOpponents = () => INIT_PIECES_OPPONENT.map(p => clampPiece({ ...p })); 
  const freshBall = () => INIT_BALL.map(p => clampPiece({ ...p })); 
  const resetAll = () => {
    setPieces(freshAttackers());
    setPiecesOpponent(freshOpponents());
    setBall(freshBall());
    setRev(r => r + 1);
  };

  const resetPositions = () => {
    setPieces(clone(INIT_PIECES).map(clampPiece));
    setBall(freshBall());
    setRev(r => r + 1);
  };

  const resetPositionsOpponent = () => {
    setPiecesOpponent(clone(INIT_PIECES_OPPONENT).map(clampPiece));
    setRev(r => r + 1);
  };

  const boardRef = useRef<View>(null);

  return (
    <View style={styles.wrap}>
      <View style={[styles.board, { width: BOARD_W, height: BOARD_H }]} ref={boardRef}>
        <ImageBackground source={require('../assets/court_half.png')} style={StyleSheet.absoluteFill} resizeMode="cover" />

        {(isEnabled ? pieces.slice(0, 3) : pieces).map(p => (
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
        {ball.map(p => (
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
        {!isHideOp && (isEnabled ? piecesOpponent.slice(0, 3) : piecesOpponent).map(p => (
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

      <View style={styles.toolbar}>
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
  board: { backgroundColor: '#F10101', borderRadius: 12, overflow: 'hidden', height: '100%' },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', paddingHorizontal: 12, alignItems: 'center' },
  text: { justifyContent: 'center', paddingHorizontal: 12, color: '#fff', fontWeight: '700', fontSize: 20},
  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '600' },
});
