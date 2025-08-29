"use client";

import React from 'react';
import { useTournament } from '@/contexts/TournamentContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, SkipForward, SkipBack, Trophy } from 'lucide-react';

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

  const calculatePrizeAmount = (percentage: number): number => {
    return (state.totalPrizePool * percentage) / 100;
  };

  const getPositionSuffix = (position: number): string => {
    if (position === 1) return 'º';
    if (position === 2) return 'º';
    if (position === 3) return 'º';
    return 'º';
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

      {/* Seção de Premiação */}
      {state.totalPrizePool > 0 && state.prizeStructure.length > 0 && (
        <Card className="w-full max-w-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Premiação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-green-600">
                Prize Pool: R$ {state.totalPrizePool.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                {state.players.length} jogadores
              </div>
            </div>
            
            <div className="space-y-3">
              {state.prizeStructure
                .sort((a, b) => a.position - b.position)
                .map((prize) => (
                  <div 
                    key={prize.position} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {prize.position}
                      </div>
                      <span className="font-medium">
                        {prize.position}{getPositionSuffix(prize.position)} Lugar
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        R$ {calculatePrizeAmount(prize.percentage).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {prize.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

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