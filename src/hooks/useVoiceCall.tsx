import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

type CallType = 'one_on_one' | 'group' | 'topic' | 'free';
type CallStatus = 'idle' | 'matching' | 'connecting' | 'connected' | 'ended';

interface CallRoom {
  id: string;
  room_type: CallType;
  topic?: string;
  max_participants: number;
  current_participants: number;
  status: 'waiting' | 'active' | 'ended';
}

interface CallParticipant {
  user_id: string;
  is_muted: boolean;
  profile: {
    display_name: string;
    level: string;
  };
}

export const useVoiceCall = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [currentRoom, setCurrentRoom] = useState<CallRoom | null>(null);
  const [participants, setParticipants] = useState<CallParticipant[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [matchingTimer, setMatchingTimer] = useState(0);
  
  const localStream = useRef<MediaStream | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const matchingTimeout = useRef<NodeJS.Timeout | null>(null);
  const realtimeChannel = useRef<any>(null);

  // WebRTC configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Start matchmaking for a specific call type
  const startMatchmaking = useCallback(async (callType: CallType, topic?: string) => {
    console.log('startMatchmaking called with:', callType, topic);
    if (!user) {
      console.log('startMatchmaking: No user found');
      return;
    }

    try {
      console.log('Setting callStatus to matching');
      setCallStatus('matching');
      setMatchingTimer(120); // 2 minutes

      console.log('Cleaning up existing matchmaking entries');
      // First, clean up any existing matchmaking entries for this user
      await supabase
        .from('matchmaking_queue')
        .delete()
        .eq('user_id', user.id);

      console.log('Inserting new matchmaking entry');
      // Join matchmaking queue
      const { error: queueError } = await supabase
        .from('matchmaking_queue')
        .insert({
          user_id: user.id,
          call_type: callType,
          topic: topic,
          user_level: 'beginner' // TODO: Get from user profile
        });

      if (queueError) {
        console.error('Queue insertion error:', queueError);
        throw queueError;
      }

      console.log('Starting matching timer');
      // Start matching timer
      matchingTimeout.current = setInterval(() => {
        setMatchingTimer(prev => {
          console.log('Timer tick:', prev);
          if (prev <= 1) {
            handleMatchingTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      console.log('Listening for room assignments');
      // Listen for room assignments
      await listenForRoomAssignments();

    } catch (error) {
      console.error('Matchmaking error:', error);
      toast({ title: 'Error', description: 'Failed to start matchmaking', variant: 'destructive' });
      setCallStatus('idle');
    }
  }, [user, toast]);

  // Handle matching timeout (no partner found)
  const handleMatchingTimeout = useCallback(async () => {
    if (matchingTimeout.current) {
      clearInterval(matchingTimeout.current);
      matchingTimeout.current = null;
    }

    // Remove from queue
    if (user) {
      await supabase
        .from('matchmaking_queue')
        .delete()
        .eq('user_id', user.id);
    }

    setCallStatus('idle');
    toast({ 
      title: 'No partner found', 
      description: 'Try again or choose a different call type',
      variant: 'destructive' 
    });
  }, [user, toast]);

  // Listen for room assignments via realtime
  const listenForRoomAssignments = useCallback(async () => {
    if (!user) return;

    realtimeChannel.current = supabase
      .channel('call-matching')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_participants',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          const roomId = payload.new.room_id;
          await joinCallRoom(roomId);
        }
      )
      .subscribe();
  }, [user]);

  // Join a call room
  const joinCallRoom = useCallback(async (roomId: string) => {
    try {
      setCallStatus('connecting');

      // Get room details
      const { data: room, error: roomError } = await supabase
        .from('call_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError) throw roomError;

      // Get participants with their profiles  
      const { data: participantData, error: participantError } = await supabase
        .from('call_participants')
        .select(`
          user_id,
          is_muted,
          profiles!call_participants_user_id_fkey (display_name, level)
        `)
        .eq('room_id', roomId);

      if (participantError) throw participantError;

      setCurrentRoom({
        id: room.id,
        room_type: room.room_type as CallType,
        topic: room.topic,
        max_participants: room.max_participants || 2,
        current_participants: room.current_participants || 0,
        status: room.status as 'waiting' | 'active' | 'ended'
      });
      
      setParticipants((participantData || []).map((p: any) => ({
        user_id: p.user_id,
        is_muted: p.is_muted,
        profile: {
          display_name: p.profiles?.display_name || 'Anonymous',
          level: p.profiles?.level || 'beginner'
        }
      })));

      // Initialize WebRTC
      await initializeWebRTC();
      
      // Clear matching timer
      if (matchingTimeout.current) {
        clearInterval(matchingTimeout.current);
        matchingTimeout.current = null;
      }

      setCallStatus('connected');
      toast({ title: 'Connected!', description: 'Call started successfully' });

    } catch (error) {
      console.error('Error joining room:', error);
      toast({ title: 'Connection failed', description: 'Could not join the call', variant: 'destructive' });
      setCallStatus('idle');
    }
  }, [toast]);

  // Initialize WebRTC connection
  const initializeWebRTC = useCallback(async () => {
    try {
      // Get user media
      localStream.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000
        }
      });

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({ title: 'Microphone access denied', description: 'Please allow microphone access to make calls', variant: 'destructive' });
      throw error;
    }
  }, [toast]);

  // Toggle mute/unmute
  const toggleMute = useCallback(async () => {
    if (!localStream.current || !user) return;

    const newMutedState = !isMuted;
    
    // Mute/unmute local audio tracks
    localStream.current.getAudioTracks().forEach(track => {
      track.enabled = !newMutedState;
    });

    // Update database
    if (currentRoom) {
      await supabase
        .from('call_participants')
        .update({ is_muted: newMutedState })
        .eq('room_id', currentRoom.id)
        .eq('user_id', user.id);
    }

    setIsMuted(newMutedState);
  }, [isMuted, user, currentRoom]);

  // End call
  const endCall = useCallback(async () => {
    try {
      // Clean up WebRTC connections
      peerConnections.current.forEach(pc => pc.close());
      peerConnections.current.clear();

      // Stop local stream
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
        localStream.current = null;
      }

      // Update database
      if (user && currentRoom) {
        await supabase
          .from('call_participants')
          .update({ left_at: new Date().toISOString() })
          .eq('room_id', currentRoom.id)
          .eq('user_id', user.id);
      }

      // Clean up realtime subscription
      if (realtimeChannel.current) {
        supabase.removeChannel(realtimeChannel.current);
        realtimeChannel.current = null;
      }

      // Clear timers
      if (matchingTimeout.current) {
        clearInterval(matchingTimeout.current);
        matchingTimeout.current = null;
      }

      setCallStatus('ended');
      setCurrentRoom(null);
      setParticipants([]);
      setIsMuted(false);

      // Reset to idle after a moment
      setTimeout(() => setCallStatus('idle'), 2000);

    } catch (error) {
      console.error('Error ending call:', error);
      setCallStatus('idle');
    }
  }, [user, currentRoom]);

  // Cancel matchmaking
  const cancelMatchmaking = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from('matchmaking_queue')
        .delete()
        .eq('user_id', user.id);

      if (matchingTimeout.current) {
        clearInterval(matchingTimeout.current);
        matchingTimeout.current = null;
      }

      setCallStatus('idle');
      setMatchingTimer(0);

    } catch (error) {
      console.error('Error canceling matchmaking:', error);
    }
  }, [user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (matchingTimeout.current) {
        clearInterval(matchingTimeout.current);
      }
      if (realtimeChannel.current) {
        supabase.removeChannel(realtimeChannel.current);
      }
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
      }
      peerConnections.current.forEach(pc => pc.close());
    };
  }, []);

  return {
    callStatus,
    currentRoom,
    participants,
    isMuted,
    matchingTimer,
    startMatchmaking,
    toggleMute,
    endCall,
    cancelMatchmaking
  };
};