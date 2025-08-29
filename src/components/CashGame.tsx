"use client";

import React, { useState } from 'react';
import { useTournament, CashGamePlayer } from '@/contexts/TournamentContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, UserPlus, Trash2, Plus, Minus, Clock, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export function CashGame() {
  const { state, dispatch } = useTournament();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerAmount, setNewPlayerAmount] = useState('');
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPlayerTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const addPlayer = () => {
    if (newPlayerName.trim() && newPlayerAmount) {
      dispatch({
        type: 'ADD_CASH_GAME_PLAYER',
        payload: {
          name: newPlayerName.trim(),
          amountSpent: parseFloat(newPlayerAmount) || 0,
        },
      });
      setNewPlayerName('');
      setNewPlayerAmount('');
      setIsAddPlayerOpen(false);
    }
  };

  const updatePlayerAmount = (playerId: string, amount: number) => {
    const player = state.cashGamePlayers.find(p => p.id === playerId);
    if (player) {
      const updatedPlayer = { ...player, amountSpent: Math.max(0, amount) };
      dispatch({ type: 'UPDATE_CASH_GAME_PLAYER', payload: updatedPlayer });
    }
  };

  const removePlayer = (playerId: string) => {
    dispatch({ type: 'REMOVE_CASH_GAME_PLAYER', payload: playerId });
  };

  const togglePlayerStatus = (playerId: string) => {
    dispatch({ type: 'TOGGLE_CASH_GAME_PLAYER_STATUS', payload: playerId });
  };

  const totalPlayers = state.cashGamePlayers.length;
  const activePlayers = state.cashGamePlayers.filter(p => p.isActive).length;
  const totalMoney = state.cashGamePlayers.reduce((sum, p) => sum + p.amountSpent, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 p-4">
      <div className="flex flex-col items-center space-y-6">
        
        {/* Timer Principal - Cash Game */}
        <Card className="w-full max-w-2xl border-2 border-red-500 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="text-lg font-bold text-red-800 dark:text-red-200">
                CASH GAME
              </div>
              
              <div className="text-6xl md:text-8xl font-mono font-bold text-red-600 dark:text-red-400">
                {formatTime(state.cashGameTime)}
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{totalPlayers}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{activePlayers}</div>
                  <div className="text-sm text-muted-foreground">Ativos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">R$ {totalMoney.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controles do Timer */}
        <div className="flex flex-wrap justify-center gap-3">
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
            onClick={() => dispatch({ type: 'RESET_CASH_GAME_TIMER' })}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Configuração da Entrada */}
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Valor da Entrada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Label htmlFor="entryFee" className="text-sm font-medium">
                Entrada padrão (R$):
              </Label>
              <Input
                id="entryFee"
                type="number"
                value={state.cashGameEntryFee}
                onChange={(e) => dispatch({ 
                  type: 'SET_CASH_GAME_ENTRY_FEE', 
                  payload: Number(e.target.value) || 0 
                })}
                className="w-32"
                min="0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Botão Adicionar Jogador */}
        <Dialog open={isAddPlayerOpen} onOpenChange={setIsAddPlayerOpen}>
          <DialogTrigger asChild>
            <Button className="w-full max-w-md bg-red-600 hover:bg-red-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Adicionar Jogador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Jogador</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="playerName">Nome do Jogador</Label>
                <Input
                  id="playerName"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="Digite o nome do jogador"
                />
              </div>
              <div>
                <Label htmlFor="playerAmount">Valor Gasto (R$)</Label>
                <Input
                  id="playerAmount"
                  type="number"
                  value={newPlayerAmount}
                  onChange={(e) => setNewPlayerAmount(e.target.value)}
                  placeholder={`${state.cashGameEntryFee}`}
                  min="0"
                />
              </div>
              <Button onClick={addPlayer} className="w-full">
                Adicionar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Lista de Jogadores */}
        <div className="w-full max-w-4xl space-y-4">
          {state.cashGamePlayers.map((player) => (
            <Card key={player.id} className={`${player.isActive ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-gray-300 bg-gray-50 dark:bg-gray-800'}`}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{player.name}</h3>
                      <Badge variant={player.isActive ? "default" : "secondary"}>
                        {player.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        R$ {player.amountSpent.toFixed(2)}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatPlayerTime(player.timeIn)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-3">
                    {/* Controle de Valor */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updatePlayerAmount(player.id, player.amountSpent - state.cashGameEntryFee)}
                        disabled={player.amountSpent <= 0}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-20 text-center text-sm">R$ {player.amountSpent.toFixed(0)}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updatePlayerAmount(player.id, player.amountSpent + state.cashGameEntryFee)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    {/* Toggle Ativo/Inativo */}
                    <Button
                      variant={player.isActive ? "destructive" : "default"}
                      size="sm"
                      onClick={() => togglePlayerStatus(player.id)}
                    >
                      {player.isActive ? 'Sair' : 'Entrar'}
                    </Button>
                    
                    {/* Remover */}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removePlayer(player.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {state.cashGamePlayers.length === 0 && (
          <Card className="w-full max-w-2xl">
            <CardContent className="p-8 text-center text-muted-foreground">
              Nenhum jogador no cash game. Adicione jogadores para começar.
            </CardContent>
          </Card>
        )}

        {/* Status */}
        <div className="text-center text-sm text-muted-foreground">
          {state.isRunning && 'Cash game em andamento'}
          {state.isPaused && 'Cash game pausado'}
          {!state.isRunning && !state.isPaused && 'Cash game parado'}
        </div>
      </div>
    </div>
  );
}