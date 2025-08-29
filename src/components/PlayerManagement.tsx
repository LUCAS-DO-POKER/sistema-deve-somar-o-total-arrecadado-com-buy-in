"use client";

import React, { useState } from 'react';
import { useTournament, Player } from '@/contexts/TournamentContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Minus, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export function PlayerManagement() {
  const { state, dispatch } = useTournament();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);

  const addPlayer = () => {
    if (newPlayerName.trim()) {
      dispatch({
        type: 'ADD_PLAYER',
        payload: {
          name: newPlayerName.trim(),
          buyIns: 1,
          rebuys: 0,
          addons: 0,
        },
      });
      setNewPlayerName('');
      setIsAddPlayerOpen(false);
    }
  };

  const updatePlayerField = (playerId: string, field: keyof Player, value: number) => {
    const player = state.players.find(p => p.id === playerId);
    if (player) {
      const updatedPlayer = { ...player, [field]: Math.max(0, value) };
      // Recalcular total
      updatedPlayer.totalSpent = 
        (updatedPlayer.buyIns * state.buyInAmount) + 
        (updatedPlayer.rebuys * state.rebuyAmount) + 
        (updatedPlayer.addons * state.addonAmount);
      
      dispatch({ type: 'UPDATE_PLAYER', payload: updatedPlayer });
    }
  };

  const removePlayer = (playerId: string) => {
    dispatch({ type: 'REMOVE_PLAYER', payload: playerId });
  };

  const totalPlayers = state.players.length;
  const totalBuyIns = state.players.reduce((sum, p) => sum + p.buyIns, 0);
  const totalRebuys = state.players.reduce((sum, p) => sum + p.rebuys, 0);
  const totalAddons = state.players.reduce((sum, p) => sum + p.addons, 0);

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{totalPlayers}</div>
            <div className="text-sm text-muted-foreground">Jogadores</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{totalBuyIns}</div>
            <div className="text-sm text-muted-foreground">Buy-ins</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{totalRebuys}</div>
            <div className="text-sm text-muted-foreground">Rebuys</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{totalAddons}</div>
            <div className="text-sm text-muted-foreground">Add-ons</div>
          </CardContent>
        </Card>
      </div>

      {/* Configurações de Valores */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Valores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="buyInAmount">Buy-in (R$)</Label>
              <Input
                id="buyInAmount"
                type="number"
                value={state.buyInAmount}
                onChange={(e) => dispatch({ 
                  type: 'UPDATE_BUY_IN_AMOUNT', 
                  payload: Number(e.target.value) || 0 
                })}
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="rebuyAmount">Rebuy (R$)</Label>
              <Input
                id="rebuyAmount"
                type="number"
                value={state.rebuyAmount}
                onChange={(e) => dispatch({ 
                  type: 'UPDATE_REBUY_AMOUNT', 
                  payload: Number(e.target.value) || 0 
                })}
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="addonAmount">Add-on (R$)</Label>
              <Input
                id="addonAmount"
                type="number"
                value={state.addonAmount}
                onChange={(e) => dispatch({ 
                  type: 'UPDATE_ADDON_AMOUNT', 
                  payload: Number(e.target.value) || 0 
                })}
                min="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão Adicionar Jogador */}
      <Dialog open={isAddPlayerOpen} onOpenChange={setIsAddPlayerOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
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
                onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
              />
            </div>
            <Button onClick={addPlayer} className="w-full">
              Adicionar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lista de Jogadores */}
      <div className="space-y-4">
        {state.players.map((player) => (
          <Card key={player.id}>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{player.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">
                      Total: R$ {player.totalSpent.toFixed(2)}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Buy-ins */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium w-16">Buy-ins:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updatePlayerField(player.id, 'buyIns', player.buyIns - 1)}
                      disabled={player.buyIns <= 1}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center">{player.buyIns}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updatePlayerField(player.id, 'buyIns', player.buyIns + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  {/* Rebuys */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium w-16">Rebuys:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updatePlayerField(player.id, 'rebuys', player.rebuys - 1)}
                      disabled={player.rebuys <= 0}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center">{player.rebuys}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updatePlayerField(player.id, 'rebuys', player.rebuys + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  {/* Add-ons */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium w-16">Add-ons:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updatePlayerField(player.id, 'addons', player.addons - 1)}
                      disabled={player.addons <= 0}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center">{player.addons}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updatePlayerField(player.id, 'addons', player.addons + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                
                  </div>
                  
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

      {state.players.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Nenhum jogador cadastrado. Adicione jogadores para começar o torneio.
          </CardContent>
        </Card>
      )}
    </div>
  );
}