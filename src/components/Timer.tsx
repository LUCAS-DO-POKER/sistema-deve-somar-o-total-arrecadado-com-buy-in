"use client";

import React from 'react';
import { useTournament } from '@/contexts/TournamentContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
      {/* Cronômetro Principal com Premiação Integrada */}
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          {/* Cronômetro */}
          <div className="text-center space-y-4 mb-6">
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

          {/* Seção de Premiação - SEMPRE VISÍVEL */}
          <div className="border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-4 mt-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
                Premiação
              </h3>
            </div>
            
            <div className="text-center mb-4">
              <div className="text-xl font-bold text-green-600">
                Prize Pool: R$ {state.totalPrizePool.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                {state.players.length} jogadores
              </div>
            </div>
            
            {state.prizeStructure.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {state.prizeStructure
                    .sort((a, b) => a.position - b.position)
                    .slice(0, 4) // Mostrar apenas os 4 primeiros para não ocupar muito espaço
                    .map((prize) => (
                      <div 
                        key={prize.position} 
                        className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500 text-white text-xs font-bold">
                            {prize.position}
                          </div>
                          <span className="text-sm font-medium">
                            {prize.position}{getPositionSuffix(prize.position)} Lugar
                          </span>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm font-bold text-green-600">
                            R$ {calculatePrizeAmount(prize.percentage).toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {prize.percentage}%
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                
                {state.prizeStructure.length > 4 && (
                  <div className="text-center mt-2 text-xs text-muted-foreground">
                    +{state.prizeStructure.length - 4} posições premiadas
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                <p className="text-sm">Estrutura de premiação não configurada</p>
                <p className="text-xs mt-1">Configure na aba "Premiação"</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações das Blinds com ANTE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-sm text-muted-foreground mb-2">Blind Atual</div>
            <div className="text-2xl font-bold">
              {currentBlind ? `${currentBlind.smallBlind}/${currentBlind.bigBlind}` : 'N/A'}
            </div>
            {currentBlind?.ante && (
              <div className="text-lg text-orange-600 font-semibold mt-1">
                Ante: {currentBlind.ante}
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              {currentBlind ? `${currentBlind.duration} min` : ''}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-sm text-muted-foreground mb-2">Próxima Blind</div>
            <div className="text-2xl font-bold">
              {nextBlind ? `${nextBlind.smallBlind}/${nextBlind.bigBlind}` : 'Final'}
            </div>
            {nextBlind?.ante && (
              <div className="text-lg text-orange-600 font-semibold mt-1">
                Ante: {nextBlind.ante}
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              {nextBlind ? `${nextBlind.duration} min` : ''}
            </div>
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