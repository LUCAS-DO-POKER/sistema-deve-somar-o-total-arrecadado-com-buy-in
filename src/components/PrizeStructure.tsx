"use client";

import React, { useState } from 'react';
import { useTournament, PrizeStructure as PrizeStructureType } from '@/contexts/TournamentContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';

export function PrizeStructure() {
  const { state, dispatch } = useTournament();
  const [newPosition, setNewPosition] = useState('');
  const [newPercentage, setNewPercentage] = useState('');

  const addPrizePosition = () => {
    const position = parseInt(newPosition);
    const percentage = parseFloat(newPercentage);
    
    if (position > 0 && percentage > 0 && percentage <= 100) {
      const newStructure = [...state.prizeStructure, { position, percentage }]
        .sort((a, b) => a.position - b.position);
      
      dispatch({ type: 'UPDATE_PRIZE_STRUCTURE', payload: newStructure });
      setNewPosition('');
      setNewPercentage('');
    }
  };

  const removePrizePosition = (position: number) => {
    const newStructure = state.prizeStructure.filter(p => p.position !== position);
    dispatch({ type: 'UPDATE_PRIZE_STRUCTURE', payload: newStructure });
  };

  const updatePrizePercentage = (position: number, percentage: number) => {
    const newStructure = state.prizeStructure.map(p =>
      p.position === position ? { ...p, percentage: Math.max(0, Math.min(100, percentage)) } : p
    );
    dispatch({ type: 'UPDATE_PRIZE_STRUCTURE', payload: newStructure });
  };

  const totalPercentage = state.prizeStructure.reduce((sum, p) => sum + p.percentage, 0);
  const isValidStructure = Math.abs(totalPercentage - 100) < 0.01;

  const calculatePrizeAmount = (percentage: number): number => {
    return (state.totalPrizePool * percentage) / 100;
  };

  return (
    <div className="space-y-6">
      {/* Resumo do Prize Pool */}
      <Card>
        <CardHeader>
          <CardTitle>Prize Pool Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600">
              R$ {state.totalPrizePool.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Arrecadado de {state.players.length} jogadores
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status da Estrutura */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Total da distribuição:</span>
              <Badge 
                variant={isValidStructure ? "default" : "destructive"}
                className="ml-2"
              >
                {totalPercentage.toFixed(1)}%
              </Badge>
            </div>
            {!isValidStructure && (
              <div className="text-sm text-destructive">
                A soma deve ser exatamente 100%
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Adicionar Nova Posição */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Posição Premiada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="position">Posição</Label>
              <Input
                id="position"
                type="number"
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                placeholder="1, 2, 3..."
                min="1"
              />
            </div>
            
            <div>
              <Label htmlFor="percentage">Porcentagem (%)</Label>
              <Input
                id="percentage"
                type="number"
                value={newPercentage}
                onChange={(e) => setNewPercentage(e.target.value)}
                placeholder="50, 30, 20..."
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            
            <div className="flex items-end">
              <Button onClick={addPrizePosition} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estrutura Atual */}
      <Card>
        <CardHeader>
          <CardTitle>Estrutura de Premiação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {state.prizeStructure.map((prize) => (
              <div key={prize.position} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-lg font-semibold">
                    {prize.position}º Lugar
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={prize.percentage}
                      onChange={(e) => updatePrizePercentage(prize.position, parseFloat(e.target.value) || 0)}
                      className="w-20"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span>%</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      R$ {calculatePrizeAmount(prize.percentage).toFixed(2)}
                    </div>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removePrizePosition(prize.position)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {state.prizeStructure.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              Nenhuma posição premiada configurada.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Presets Comuns */}
      <Card>
        <CardHeader>
          <CardTitle>Estruturas Pré-definidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => dispatch({
                type: 'UPDATE_PRIZE_STRUCTURE',
                payload: [
                  { position: 1, percentage: 100 }
                ]
              })}
            >
              Winner Takes All
            </Button>
            
            <Button
              variant="outline"
              onClick={() => dispatch({
                type: 'UPDATE_PRIZE_STRUCTURE',
                payload: [
                  { position: 1, percentage: 70 },
                  { position: 2, percentage: 30 }
                ]
              })}
            >
              70% / 30%
            </Button>
            
            <Button
              variant="outline"
              onClick={() => dispatch({
                type: 'UPDATE_PRIZE_STRUCTURE',
                payload: [
                  { position: 1, percentage: 50 },
                  { position: 2, percentage: 30 },
                  { position: 3, percentage: 20 }
                ]
              })}
            >
              50% / 30% / 20%
            </Button>
            
            <Button
              variant="outline"
              onClick={() => dispatch({
                type: 'UPDATE_PRIZE_STRUCTURE',
                payload: [
                  { position: 1, percentage: 40 },
                  { position: 2, percentage: 25 },
                  { position: 3, percentage: 20 },
                  { position: 4, percentage: 15 }
                ]
              })}
            >
              40% / 25% / 20% / 15%
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}