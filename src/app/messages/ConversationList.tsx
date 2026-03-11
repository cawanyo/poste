'use client'
import ChatWidget from '@/components/ChatPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatDateTime } from '@/lib/utils';
import { ArrowRight, Link, MessageCircle, Plane } from 'lucide-react';
import { useState } from 'react';


interface ConversationListProps {
    conversations: any[];
    currentUserId: string;
}
function ConversationList({ conversations, currentUserId }: ConversationListProps) {

    const [currentTravel, setCurrentTravel] = useState<any>(null);
    const [currentOtherUser, setCurrentOtherUser] = useState<any>(null);

    return (
        <div className="mx-auto max-w-2xl px-4 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Messages</h1>
            <p className="text-gray-400 text-sm mt-1">Vos conversations avec les voyageurs</p>
          </div>
    
          {conversations.length === 0 ? (
            <div className="text-center py-20">
              <MessageCircle className="h-14 w-14 mx-auto mb-4 text-gray-600" />
              <p className="text-lg font-medium text-gray-400">Aucun message</p>
              <p className="text-sm text-gray-600">Contactez un voyageur depuis la page d&apos;un voyage</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((msg) => {
                const other = msg.senderId === currentUserId ? msg.receiver : msg.sender;
                return (
                  <div
                    key={msg.id}
                    onClick={() => {setCurrentOtherUser(msg.senderId === currentUserId ? msg.receiver : msg.sender); setCurrentTravel(msg.travel)}}
                  >
                    <Card className="hover:border-violet-500/30 transition-all cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-11 w-11 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {other.name[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="text-white font-medium text-sm">{other.name}</p>
                            <p className="text-xs text-gray-500">{formatDateTime(msg.createdAt)}</p>
                          </div>
                          {msg.travel && (
                            <div className="flex items-center gap-1 text-xs text-violet-400 mb-1">
                              <Plane className="h-3 w-3" />
                              {msg.travel.departureCity}
                              <ArrowRight className="h-2.5 w-2.5" />
                              {msg.travel.arrivalCity}
                            </div>
                          )}
                          <p className="text-sm text-gray-400 truncate">{msg.content}</p>
                        </div>
                        {!msg.read && msg.receiverId === currentUserId && (
                          <div className="h-2 w-2 rounded-full bg-violet-500 flex-shrink-0" />
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}

            { currentOtherUser && currentTravel && (
                <ChatWidget
                    currentUserId={currentUserId}
                    otherUser={currentOtherUser}
                    travelId={currentTravel?.id}
                    opened={true}
                />)
                }
        </div>
      );
    }
    

export default ConversationList