import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useVoiceCall } from '@/hooks/useVoiceCall';
import { Mic, MicOff, Phone, PhoneOff, Users, Clock, Volume2, Signal, Settings, MessageSquare } from 'lucide-react';

interface CallInterfaceProps {
  onEndCall: () => void;
}

const CallInterface = ({ onEndCall }: CallInterfaceProps) => {
  const { 
    callStatus, 
    currentRoom, 
    participants, 
    isMuted, 
    toggleMute, 
    endCall 
  } = useVoiceCall();
  
  const [callDuration, setCallDuration] = useState(0);

  // Call duration timer
  useEffect(() => {
    if (callStatus === 'connected') {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setCallDuration(0);
    }
  }, [callStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = async () => {
    await endCall();
    onEndCall();
  };

  if (callStatus === 'connecting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto shadow-xl">
          <CardHeader className="text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping"></div>
              <div className="relative bg-gradient-to-r from-green-400 to-green-600 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <Phone className="h-8 w-8 text-white animate-pulse" />
              </div>
            </div>
            <CardTitle className="text-xl font-bold text-green-600">
              Connecting...
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Establishing secure connection with participants
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (callStatus !== 'connected' || !currentRoom) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Call Info */}
        <Card className="mb-6 shadow-lg border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping"></div>
                  <div className="relative bg-gradient-to-r from-green-400 to-green-600 rounded-full w-12 h-12 flex items-center justify-center">
                    <Volume2 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-green-600">Voice Call Active</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {currentRoom.room_type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="border-green-200">
                      <Signal className="h-3 w-3 mr-1" />
                      HD Quality
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="bg-secondary/20 px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                    <Clock className="h-5 w-5" />
                    {formatDuration(callDuration)}
                  </div>
                  <p className="text-xs text-muted-foreground">Call Duration</p>
                </div>
              </div>
            </div>
            
            {currentRoom.topic && (
              <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="font-medium text-primary">Topic:</span>
                  <span className="text-foreground">{currentRoom.topic}</span>
                </div>
              </div>
            )}
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Participants Panel */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Participants
                <Badge variant="secondary">
                  {participants.length}/{currentRoom.max_participants}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {participants.map((participant) => (
                <div 
                  key={participant.user_id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-secondary/10 to-primary/5 border"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {!participant.is_muted && (
                        <div className="absolute -inset-1 bg-green-400/50 rounded-full animate-pulse"></div>
                      )}
                      <div className="relative h-12 w-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
                        <span className="text-sm font-bold text-white">
                          {participant.profile.display_name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold">{participant.profile.display_name}</p>
                      <p className="text-sm text-muted-foreground capitalize flex items-center gap-1">
                        <Badge variant="outline" className="text-xs px-2 py-0">
                          {participant.profile.level}
                        </Badge>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {participant.is_muted ? (
                      <div className="bg-red-100 p-2 rounded-full">
                        <MicOff className="h-4 w-4 text-red-600" />
                      </div>
                    ) : (
                      <div className="bg-green-100 p-2 rounded-full">
                        <Mic className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Call Controls Panel */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Call Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Controls */}
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <Button
                    variant={isMuted ? "destructive" : "secondary"}
                    size="lg"
                    onClick={toggleMute}
                    className={`rounded-full h-16 w-16 shadow-lg transition-all duration-300 ${
                      isMuted 
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    {isMuted ? <MicOff className="h-7 w-7 text-white" /> : <Mic className="h-7 w-7 text-white" />}
                  </Button>
                  <p className="text-xs mt-2 font-medium">
                    {isMuted ? 'Unmute' : 'Mute'}
                  </p>
                </div>
                
                <div className="text-center">
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={handleEndCall}
                    className="rounded-full h-20 w-20 shadow-xl bg-red-500 hover:bg-red-600 transition-all duration-300 hover:scale-110"
                  >
                    <PhoneOff className="h-9 w-9" />
                  </Button>
                  <p className="text-xs mt-2 font-medium text-red-600">
                    End Call
                  </p>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg text-center border ${
                  isMuted ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                }`}>
                  <div className={`h-8 w-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    isMuted ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    {isMuted ? (
                      <MicOff className="h-4 w-4 text-red-600" />
                    ) : (
                      <Mic className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-xs font-medium">
                    {isMuted ? 'Muted' : 'Speaking'}
                  </p>
                </div>
                
                <div className="p-3 rounded-lg text-center bg-blue-50 border border-blue-200">
                  <div className="h-8 w-8 rounded-full bg-blue-100 mx-auto mb-2 flex items-center justify-center">
                    <Signal className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-xs font-medium">Excellent</p>
                </div>
              </div>

              {/* Call Stats */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Audio Quality:</span>
                  <span className="font-medium text-green-600">HD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Connection:</span>
                  <span className="font-medium text-green-600">Strong</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Participants:</span>
                  <span className="font-medium">{participants.length} active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Tips */}
        <Card className="mt-6 bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h3 className="font-semibold mb-1">Call Tips</h3>
                <p className="text-sm text-muted-foreground">
                  Keep your microphone close to your mouth for better audio quality. 
                  Don't forget to unmute when you want to speak!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CallInterface;