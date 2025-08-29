"use client";

import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface Player {
  id: string;
  name: string;
  buyIns: number;
  rebuys: number;
  addons: number;
  totalSpent: number;
}

export interface CashGamePlayer {
  id: string;
  name: string;
  amountSpent: number;
  timeIn: number; // em minutos
  isActive: boolean;
}

export interface BlindLevel {
  level: number;
  smallBlind: number;
  bigBlind: number;
  ante?: number;
  duration: number; // em minutos
}

export interface PrizeStructure {
  position: number;
  percentage: number;
}

export interface TournamentState {
  // Modo de jogo
  gameMode: 'tournament' | 'cashgame';
  
  // Timer
  currentLevel: number;
  timeRemaining: number; // em segundos
  isRunning: boolean;
  isPaused: boolean;
  
  // Cash Game
  cashGameTime: number; // tempo total em segundos
  cashGameEntryFee: number;
  cashGamePlayers: CashGamePlayer[];
  
  // Configurações
  blindLevels: BlindLevel[];
  defaultDuration: number;
  buyInAmount: number;
  rebuyAmount: number;
  addonAmount: number;
  
  // Jogadores
  players: Player[];
  
  // Premiação
  prizeStructure: PrizeStructure[];
  totalPrizePool: number;
  
  // Configurações gerais
  soundEnabled: boolean;
  theme: 'light' | 'dark';
}

type TournamentAction =
  | { type: 'SET_GAME_MODE'; payload: 'tournament' | 'cashgame' }
  | { type: 'START_TIMER' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'RESUME_TIMER' }
  | { type: 'RESET_TIMER' }
  | { type: 'TICK' }
  | { type: 'CASH_GAME_TICK' }
  | { type: 'RESET_CASH_GAME_TIMER' }
  | { type: 'SET_CASH_GAME_ENTRY_FEE'; payload: number }
  | { type: 'ADD_CASH_GAME_PLAYER'; payload: Omit<CashGamePlayer, 'id' | 'timeIn' | 'isActive'> }
  | { type: 'UPDATE_CASH_GAME_PLAYER'; payload: CashGamePlayer }
  | { type: 'REMOVE_CASH_GAME_PLAYER'; payload: string }
  | { type: 'TOGGLE_CASH_GAME_PLAYER_STATUS'; payload: string }
  | { type: 'NEXT_LEVEL' }
  | { type: 'PREVIOUS_LEVEL' }
  | { type: 'SET_LEVEL'; payload: number }
  | { type: 'ADD_PLAYER'; payload: Omit<Player, 'id' | 'totalSpent'> }
  | { type: 'UPDATE_PLAYER'; payload: Player }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'UPDATE_BLIND_LEVELS'; payload: BlindLevel[] }
  | { type: 'UPDATE_PRIZE_STRUCTURE'; payload: PrizeStructure[] }
  | { type: 'UPDATE_BUY_IN_AMOUNT'; payload: number }
  | { type: 'UPDATE_REBUY_AMOUNT'; payload: number }
  | { type: 'UPDATE_ADDON_AMOUNT'; payload: number }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'CALCULATE_PRIZE_POOL' };

const initialBlindLevels: BlindLevel[] = [
  { level: 1, smallBlind: 25, bigBlind: 50, duration: 15 },
  { level: 2, smallBlind: 50, bigBlind: 100, duration: 15 },
  { level: 3, smallBlind: 75, bigBlind: 150, duration: 15 },
  { level: 4, smallBlind: 100, bigBlind: 200, duration: 15 },
  { level: 5, smallBlind: 150, bigBlind: 300, duration: 15 },
  { level: 6, smallBlind: 200, bigBlind: 400, duration: 15 },
  { level: 7, smallBlind: 300, bigBlind: 600, duration: 15 },
  { level: 8, smallBlind: 400, bigBlind: 800, duration: 15 },
  { level: 9, smallBlind: 500, bigBlind: 1000, duration: 15 },
  { level: 10, smallBlind: 600, bigBlind: 1200, duration: 15 },
];

const initialPrizeStructure: PrizeStructure[] = [
  { position: 1, percentage: 50 },
  { position: 2, percentage: 30 },
  { position: 3, percentage: 20 },
];

const initialState: TournamentState = {
  gameMode: 'tournament',
  currentLevel: 0,
  timeRemaining: 15 * 60, // 15 minutos em segundos
  isRunning: false,
  isPaused: false,
  cashGameTime: 0,
  cashGameEntryFee: 100,
  cashGamePlayers: [],
  blindLevels: initialBlindLevels,
  defaultDuration: 15,
  buyInAmount: 100,
  rebuyAmount: 100,
  addonAmount: 50,
  players: [],
  prizeStructure: initialPrizeStructure,
  totalPrizePool: 0,
  soundEnabled: true,
  theme: 'light',
};

function calculatePlayerTotal(player: Omit<Player, 'totalSpent'>, buyInAmount: number, rebuyAmount: number, addonAmount: number): number {
  return (player.buyIns * buyInAmount) + (player.rebuys * rebuyAmount) + (player.addons * addonAmount);
}

function tournamentReducer(state: TournamentState, action: TournamentAction): TournamentState {
  switch (action.type) {
    case 'SET_GAME_MODE':
      return { 
        ...state, 
        gameMode: action.payload,
        isRunning: false,
        isPaused: false,
      };
    
    case 'START_TIMER':
      return { ...state, isRunning: true, isPaused: false };
    
    case 'PAUSE_TIMER':
      return { ...state, isRunning: false, isPaused: true };
    
    case 'RESUME_TIMER':
      return { ...state, isRunning: true, isPaused: false };
    
    case 'RESET_TIMER':
      const currentBlind = state.blindLevels[state.currentLevel];
      return { 
        ...state, 
        isRunning: false, 
        isPaused: false,
        timeRemaining: currentBlind ? currentBlind.duration * 60 : state.defaultDuration * 60
      };
    
    case 'TICK':
      if (!state.isRunning || state.timeRemaining <= 0) return state;
      return { ...state, timeRemaining: state.timeRemaining - 1 };
    
    case 'CASH_GAME_TICK':
      if (!state.isRunning) return state;
      const updatedCashGamePlayers = state.cashGamePlayers.map(player => 
        player.isActive 
          ? { ...player, timeIn: player.timeIn + (1/60) } // Adiciona 1 segundo convertido para minutos
          : player
      );
      return { 
        ...state, 
        cashGameTime: state.cashGameTime + 1,
        cashGamePlayers: updatedCashGamePlayers
      };
    
    case 'RESET_CASH_GAME_TIMER':
      return {
        ...state,
        cashGameTime: 0,
        isRunning: false,
        isPaused: false,
        cashGamePlayers: state.cashGamePlayers.map(player => ({
          ...player,
          timeIn: 0,
          isActive: false
        }))
      };
    
    case 'SET_CASH_GAME_ENTRY_FEE':
      return { ...state, cashGameEntryFee: action.payload };
    
    case 'ADD_CASH_GAME_PLAYER':
      const newCashGamePlayer: CashGamePlayer = {
        ...action.payload,
        id: Date.now().toString(),
        timeIn: 0,
        isActive: true,
      };
      return { ...state, cashGamePlayers: [...state.cashGamePlayers, newCashGamePlayer] };
    
    case 'UPDATE_CASH_GAME_PLAYER':
      const updatedCashPlayers = state.cashGamePlayers.map(player =>
        player.id === action.payload.id ? action.payload : player
      );
      return { ...state, cashGamePlayers: updatedCashPlayers };
    
    case 'REMOVE_CASH_GAME_PLAYER':
      return { 
        ...state, 
        cashGamePlayers: state.cashGamePlayers.filter(player => player.id !== action.payload) 
      };
    
    case 'TOGGLE_CASH_GAME_PLAYER_STATUS':
      const toggledPlayers = state.cashGamePlayers.map(player =>
        player.id === action.payload 
          ? { ...player, isActive: !player.isActive }
          : player
      );
      return { ...state, cashGamePlayers: toggledPlayers };
    
    case 'NEXT_LEVEL':
      const nextLevel = Math.min(state.currentLevel + 1, state.blindLevels.length - 1);
      const nextBlind = state.blindLevels[nextLevel];
      return {
        ...state,
        currentLevel: nextLevel,
        timeRemaining: nextBlind ? nextBlind.duration * 60 : state.defaultDuration * 60,
        isRunning: false,
        isPaused: false,
      };
    
    case 'PREVIOUS_LEVEL':
      const prevLevel = Math.max(state.currentLevel - 1, 0);
      const prevBlind = state.blindLevels[prevLevel];
      return {
        ...state,
        currentLevel: prevLevel,
        timeRemaining: prevBlind ? prevBlind.duration * 60 : state.defaultDuration * 60,
        isRunning: false,
        isPaused: false,
      };
    
    case 'SET_LEVEL':
      const setBlind = state.blindLevels[action.payload];
      return {
        ...state,
        currentLevel: action.payload,
        timeRemaining: setBlind ? setBlind.duration * 60 : state.defaultDuration * 60,
        isRunning: false,
        isPaused: false,
      };
    
    case 'ADD_PLAYER':
      const newPlayer: Player = {
        ...action.payload,
        id: Date.now().toString(),
        totalSpent: calculatePlayerTotal(action.payload, state.buyInAmount, state.rebuyAmount, state.addonAmount),
      };
      return { ...state, players: [...state.players, newPlayer] };
    
    case 'UPDATE_PLAYER':
      const updatedPlayers = state.players.map(player =>
        player.id === action.payload.id ? action.payload : player
      );
      return { ...state, players: updatedPlayers };
    
    case 'REMOVE_PLAYER':
      return { 
        ...state, 
        players: state.players.filter(player => player.id !== action.payload) 
      };
    
    case 'UPDATE_BLIND_LEVELS':
      return { ...state, blindLevels: action.payload };
    
    case 'UPDATE_PRIZE_STRUCTURE':
      return { ...state, prizeStructure: action.payload };
    
    case 'UPDATE_BUY_IN_AMOUNT':
      const updatedPlayersWithNewBuyIn = state.players.map(player => ({
        ...player,
        totalSpent: calculatePlayerTotal(player, action.payload, state.rebuyAmount, state.addonAmount),
      }));
      return { 
        ...state, 
        buyInAmount: action.payload,
        players: updatedPlayersWithNewBuyIn,
      };
    
    case 'UPDATE_REBUY_AMOUNT':
      const updatedPlayersWithNewRebuy = state.players.map(player => ({
        ...player,
        totalSpent: calculatePlayerTotal(player, state.buyInAmount, action.payload, state.addonAmount),
      }));
      return { 
        ...state, 
        rebuyAmount: action.payload,
        players: updatedPlayersWithNewRebuy,
      };
    
    case 'UPDATE_ADDON_AMOUNT':
      const updatedPlayersWithNewAddon = state.players.map(player => ({
        ...player,
        totalSpent: calculatePlayerTotal(player, state.buyInAmount, state.rebuyAmount, action.payload),
      }));
      return { 
        ...state, 
        addonAmount: action.payload,
        players: updatedPlayersWithNewAddon,
      };
    
    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled };
    
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    
    case 'CALCULATE_PRIZE_POOL':
      const totalPool = state.players.reduce((sum, player) => sum + player.totalSpent, 0);
      return { ...state, totalPrizePool: totalPool };
    
    default:
      return state;
  }
}

const TournamentContext = createContext<{
  state: TournamentState;
  dispatch: React.Dispatch<TournamentAction>;
} | null>(null);

export function TournamentProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(tournamentReducer, initialState);

  // Timer effect
  useEffect(() => {
    if (!state.isRunning) return;

    const interval = setInterval(() => {
      if (state.gameMode === 'tournament') {
        dispatch({ type: 'TICK' });
      } else {
        dispatch({ type: 'CASH_GAME_TICK' });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isRunning, state.gameMode]);

  // Auto advance to next level when time runs out (only for tournament)
  useEffect(() => {
    if (state.gameMode === 'tournament' && state.timeRemaining === 0 && state.isRunning) {
      // Play sound if enabled
      if (state.soundEnabled) {
        const audio = new Audio('/sounds/alert.mp3');
        audio.play().catch(() => {
          // Fallback to system beep if audio file not available
          console.log('🔔 Tempo esgotado! Próximo nível de blind.');
        });
      }
      
      // Auto advance to next level
      setTimeout(() => {
        dispatch({ type: 'NEXT_LEVEL' });
      }, 1000);
    }
  }, [state.timeRemaining, state.isRunning, state.soundEnabled, state.gameMode]);

  // Calculate prize pool when players change
  useEffect(() => {
    dispatch({ type: 'CALCULATE_PRIZE_POOL' });
  }, [state.players, state.buyInAmount, state.rebuyAmount, state.addonAmount]);

  return (
    <TournamentContext.Provider value={{ state, dispatch }}>
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
}