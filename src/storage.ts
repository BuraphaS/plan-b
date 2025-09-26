import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PlanState } from './types';

const KEY = '@plan_b_board_v1';

export async function savePlan(state: PlanState) {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}

export async function loadPlan(): Promise<PlanState | null> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearPlan() {
  await AsyncStorage.removeItem(KEY);
}
