"use client";

import React from 'react';
import { TournamentProvider } from '@/contexts/TournamentContext';
import { Timer } from '@/components/Timer';
import { PlayerManagement } from '@/components/PlayerManagement';
import { PrizeStructure } from '@/components/PrizeStructure';
import { BlindStructure } from '@/components/BlindStructure';
import { CashGame } from '@/components/CashGame';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Users, Trophy, Settings, DollarSign } from 'lucide-react';

export default function Home() {
  return (
    <TournamentProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-center mb-2">
              Poker do Lucão
            </h1>
            <p className="text-center text-muted-foreground">
              Todos os jogadores devem enviar 10 reais no pix do lucão pelo tempo envolvido na criação desse app
            </p>
          </div>

          <Tabs defaultValue="timer" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="timer" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Timer</span>
              </TabsTrigger>
              <TabsTrigger value="players" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Jogadores</span>
              </TabsTrigger>
              <TabsTrigger value="prizes" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Premiação</span>
              </TabsTrigger>
              <TabsTrigger value="blinds" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Blinds</span>
              </TabsTrigger>
              <TabsTrigger value="cashgame" className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white data-[state=active]:bg-red-700 data-[state=active]:text-white">
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">Cash Game</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timer" className="mt-6">
              <Timer />
            </TabsContent>

            <TabsContent value="players" className="mt-6">
              <PlayerManagement />
            </TabsContent>

            <TabsContent value="prizes" className="mt-6">
              <PrizeStructure />
            </TabsContent>

            <TabsContent value="blinds" className="mt-6">
              <BlindStructure />
            </TabsContent>

            <TabsContent value="cashgame" className="mt-6">
              <CashGame />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TournamentProvider>
  );
}