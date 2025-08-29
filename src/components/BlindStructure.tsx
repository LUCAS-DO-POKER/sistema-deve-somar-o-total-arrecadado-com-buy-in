"use client";

import React, { useState } from 'react';
import { useTournament, BlindLevel } from '@/contexts/TournamentContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Edit } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function BlindStructure() {
  const { state, dispatch } = useTournament();
  const [editingLevel, setEditingLevel] = useState<BlindLevel | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [newLevel, setNewLevel] = useState({
    smallBlind: '',
    bigBlind: '',
    ante: '',
    duration: '15'
  });

  const addBlindLevel = () => {
    const smallBlind = parseInt(newLevel.smallBlind);
    const bigBlind = parseInt(newLevel.bigBlind);
    const ante = newLevel.ante ? parseInt(newLevel.ante) : undefined;
    const duration = parseInt(newLevel.duration);

    if (smallBlind > 0 && bigBlind > 0 && duration > 0) {
      const newBlindLevel: BlindLevel = {
        level: state.blindLevels.length + 1,
        smallBlind,
        bigBlind,
        ante,
        duration
      };

      const updatedLevels = [...state.blindLevels, newBlindLevel];
      dispatch({ type: 'UPDATE_BLIND_LEVELS', payload: updatedLevels });
      
      setNewLevel({
        smallBlind: '',
        bigBlind: '',
        ante: '',
        duration: '15'
      });
    }
  };

  const removeBlindLevel = (levelIndex: number) => {
    const updatedLevels = state.blindLevels
      .filter((_, index) => index !== levelIndex)
      .map((level, index) => ({ ...level, level: index + 1 }));
    
    dispatch({ type: 'UPDATE_BLIND_LEVELS', payload: updatedLevels });
  };

  const editBlindLevel = (level: BlindLevel) => {
    setEditingLevel(level);
    setIsEditDialogOpen(true);
  };

  const saveEditedLevel = () => {
    if (editingLevel) {
      const updatedLevels = state.blindLevels.map(level =>
        level.level === editingLevel.level ? editingLevel : level
      );
      dispatch({ type: 'UPDATE_BLIND_LEVELS', payload: updatedLevels });
      setEditingLevel(null);
      setIsEditDialogOpen(false);
    }
  };

  const loadPresetStructure = (preset: 'turbo' | 'normal' | 'deep') => {
    let presetLevels: BlindLevel[] = [];

    switch (preset) {
      case 'turbo':
        presetLevels = [
          { level: 1, smallBlind: 25, bigBlind: 50, duration: 10 },
          { level: 2, smallBlind: 50, bigBlind: 100, duration: 10 },
          { level: 3, smallBlind: 75, bigBlind: 150, duration: 10 },
          { level: 4, smallBlind: 100, bigBlind: 200, duration: 10 },
          { level: 5, smallBlind: 150, bigBlind: 300, duration: 10 },
          { level: 6, smallBlind: 200, bigBlind: 400, duration: 10 },
          { level: 7, smallBlind: 300, bigBlind: 600, duration: 10 },
          { level: 8, smallBlind: 500, bigBlind: 1000, duration: 10 },
          { level: 9, smallBlind: 750, bigBlind: 1500, duration: 10 },
          { level: 10, smallBlind: 1000, bigBlind: 2000, duration: 10 },
        ];
        break;
      case 'normal':
        presetLevels = [
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
        break;
      case 'deep':
        presetLevels = [
          { level: 1, smallBlind: 25, bigBlind: 50, duration: 20 },
          { level: 2, smallBlind: 50, bigBlind: 100, duration: 20 },
          { level: 3, smallBlind: 75, bigBlind: 150, duration: 20 },
          { level: 4, smallBlind: 100, bigBlind: 200, duration: 20 },
          { level: 5, smallBlind: 125, bigBlind: 250, duration: 20 },
          { level: 6, smallBlind: 150, bigBlind: 300, duration: 20 },
          { level: 7, smallBlind: 200, bigBlind: 400, duration: 20 },
          { level: 8, smallBlind: 250, bigBlind: 500, duration: 20 },
          { level: 9, smallBlind: 300, bigBlind: 600, duration: 20 },
          { level: 10, smallBlind: 400, bigBlind: 800, duration: 20 },
        ];
        break;
    }

    dispatch({ type: 'UPDATE_BLIND_LEVELS', payload: presetLevels });
  };

  return (
    <div className="space-y-6">
      {/* Estruturas Pré-definidas */}
      <Card>
        <CardHeader>
          <CardTitle>Estruturas Pré-definidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => loadPresetStructure('turbo')}
            >
              Turbo (10 min)
            </Button>
            <Button
              variant="outline"
              onClick={() => loadPresetStructure('normal')}
            >
              Normal (15 min)
            </Button>
            <Button
              variant="outline"
              onClick={() => loadPresetStructure('deep')}
            >
              Deep Stack (20 min)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Adicionar Novo Nível */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Nível de Blind</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="smallBlind">Small Blind</Label>
              <Input
                id="smallBlind"
                type="number"
                value={newLevel.smallBlind}
                onChange={(e) => setNewLevel({ ...newLevel, smallBlind: e.target.value })}
                placeholder="25"
                min="1"
              />
            </div>
            
            <div>
              <Label htmlFor="bigBlind">Big Blind</Label>
              <Input
                id="bigBlind"
                type="number"
                value={newLevel.bigBlind}
                onChange={(e) => setNewLevel({ ...newLevel, bigBlind: e.target.value })}
                placeholder="50"
                min="1"
              />
            </div>
            
            <div>
              <Label htmlFor="ante">Ante (opcional)</Label>
              <Input
                id="ante"
                type="number"
                value={newLevel.ante}
                onChange={(e) => setNewLevel({ ...newLevel, ante: e.target.value })}
                placeholder="0"
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="duration">Duração (min)</Label>
              <Input
                id="duration"
                type="number"
                value={newLevel.duration}
                onChange={(e) => setNewLevel({ ...newLevel, duration: e.target.value })}
                placeholder="15"
                min="1"
              />
            </div>
            
            <div className="flex items-end">
              <Button onClick={addBlindLevel} className="w-full">
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
          <CardTitle>Estrutura de Blinds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {state.blindLevels.map((level, index) => (
              <div 
                key={level.level} 
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  index === state.currentLevel ? 'bg-primary/10 border-primary' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <Badge variant={index === state.currentLevel ? "default" : "secondary"}>
                    Nível {level.level}
                  </Badge>
                  <div className="text-lg font-semibold">
                    {level.smallBlind}/{level.bigBlind}
                  </div>
                  {level.ante && (
                    <div className="text-sm text-muted-foreground">
                      Ante: {level.ante}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    {level.duration} min
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editBlindLevel(level)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeBlindLevel(index)}
                    disabled={state.blindLevels.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {state.blindLevels.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              Nenhum nível de blind configurado.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Nível {editingLevel?.level}</DialogTitle>
          </DialogHeader>
          {editingLevel && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editSmallBlind">Small Blind</Label>
                <Input
                  id="editSmallBlind"
                  type="number"
                  value={editingLevel.smallBlind}
                  onChange={(e) => setEditingLevel({
                    ...editingLevel,
                    smallBlind: parseInt(e.target.value) || 0
                  })}
                  min="1"
                />
              </div>
              
              <div>
                <Label htmlFor="editBigBlind">Big Blind</Label>
                <Input
                  id="editBigBlind"
                  type="number"
                  value={editingLevel.bigBlind}
                  onChange={(e) => setEditingLevel({
                    ...editingLevel,
                    bigBlind: parseInt(e.target.value) || 0
                  })}
                  min="1"
                />
              </div>
              
              <div>
                <Label htmlFor="editAnte">Ante (opcional)</Label>
                <Input
                  id="editAnte"
                  type="number"
                  value={editingLevel.ante || ''}
                  onChange={(e) => setEditingLevel({
                    ...editingLevel,
                    ante: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  min="0"
                />
              </div>
              
              <div>
                <Label htmlFor="editDuration">Duração (min)</Label>
                <Input
                  id="editDuration"
                  type="number"
                  value={editingLevel.duration}
                  onChange={(e) => setEditingLevel({
                    ...editingLevel,
                    duration: parseInt(e.target.value) || 1
                  })}
                  min="1"
                />
              </div>
              
              <Button onClick={saveEditedLevel} className="w-full">
                Salvar Alterações
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}