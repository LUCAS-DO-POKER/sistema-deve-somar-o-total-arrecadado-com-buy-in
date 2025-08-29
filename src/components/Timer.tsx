"use client";

import React from 'react';
import { useTournament } from '@/contexts/TournamentContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, RotateCcw, SkipForward, SkipBack } from 'lucide-react';

export function Timer() {
  const { state, dispatch } = useTournament();

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentBlind = state.blindLevels[state.currentLevel];
  const nextBlind = state.blindLevels[state.currentLevel + 1];

  const getTimeColor = () => {
    if (state.timeRemaining <= 60) return 'text-red-500';
    if (state.timeRemaining <= 300) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Cronômetro Principal */}
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Nível {state.currentLevel + 1}
            </div>
            
            <div className={`text-6xl md:text-8xl font-mono font-bold ${getTimeColor()}`}>
              {formatTime(state.timeRemaining)}
            </div>
            
            {state.timeRemaining <= 10 && state.isRunning && (
              <div className="text-red-500 font-bold animate-pulse">
                ATENÇÃO!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações das Blinds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-sm text-muted-foreground mb-2">Blind Atual</div>
            <div className="text-2xl font-bold">
              {currentBlind ? `${currentBlind.smallBlind}/${currentBlind.bigBlind}` : 'N/A'}
            </div>
            {currentBlind?.ante && (
              <div className="text-sm text-muted-foreground">
                Ante: {currentBlind.ante}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-sm text-muted-foreground mb-2">Próxima Blind</div>
            <div className="text-2xl font-bold">
              {nextBlind ? `${nextBlind.smallBlind}/${nextBlind.bigBlind}` : 'Final'}
            </div>
            {nextBlind?.ante && (
              <div className="text-sm text-muted-foreground">
                Ante: {nextBlind.ante}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Controles do Timer */}
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={() => dispatch({ type: 'PREVIOUS_LEVEL' })}
          disabled={state.currentLevel === 0}
        >
          <SkipBack className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        {!state.isRunning ? (
          <Button
            size="lg"
            onClick={() => dispatch({ type: state.isPaused ? 'RESUME_TIMER' : 'START_TIMER' })}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="w-4 h-4 mr-2" />
            {state.isPaused ? 'Continuar' : 'Iniciar'}
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={() => dispatch({ type: 'PAUSE_TIMER' })}
            variant="destructive"
          >
            <Pause className="w-4 h-4 mr-2" />
            Pausar
          </Button>
        )}

        <Button
          variant="outline"
          size="lg"
          onClick={() => dispatch({ type: 'RESET_TIMER' })}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={() => dispatch({ type: 'NEXT_LEVEL' })}
          disabled={state.currentLevel >= state.blindLevels.length - 1}
        >
          <SkipForward className="w-4 h-4 mr-2" />
          Próxima
        </Button>
      </div>

      {/* Status */}
      <div className="text-center text-sm text-muted-foreground">
        {state.isRunning && 'Timer em execução'}
        {state.isPaused && 'Timer pausado'}
        {!state.isRunning && !state.isPaused && 'Timer parado'}
      </div>
    </div>
  );
}