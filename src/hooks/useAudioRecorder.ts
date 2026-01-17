import { useState, useRef, useCallback, useEffect } from 'react';
import { useStore } from '../store/useStore';

interface UseAudioRecorderReturn {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  error: string | null;
}

export function useAudioRecorder(onFinished?: (blob: Blob) => void): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  // Audio Analysis Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const silenceStartRef = useRef<number>(Date.now());
  const hasSpokenRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);
  
  // To handle manual stop promise resolution
  const manualStopResolveRef = useRef<((blob: Blob | null) => void) | null>(null);

  // Cleanup function for audio analysis
  const cleanupAudioAnalysis = useCallback(() => {
    // Reset store level
    useStore.getState().setAudioLevel(0);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }

    // Also stop the media tracks to release microphone
    if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  }, []);

  // Ensure cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudioAnalysis();
    };
  }, [cleanupAudioAnalysis]);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = [];
        setIsRecording(false);
        
        cleanupAudioAnalysis();

        // Fire onFinished callback (for both auto and manual stops)
        if (onFinished) {
            onFinished(blob);
        }
        
        // Resolve promise if manual stop was called
        if (manualStopResolveRef.current) {
          manualStopResolveRef.current(blob);
          manualStopResolveRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      // --- Smart Silence Detection Setup ---
      
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const audioContext = new AudioContextClass();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      silenceStartRef.current = Date.now();
      hasSpokenRef.current = false;
      
      const SILENCE_THRESHOLD = 30; // Adaptive threshold might be better, but let's try 30.
      const SILENCE_DURATION = 1500; 
      
      const detectSilence = () => {
        if (!analyserRef.current) return;
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average volume instead of max to reduce sensitivity to single frequency spikes
        let sum = 0;
        // Skip first few bins to ignore low rumble/hum (< 100Hzish)
        const skipBins = 4; // ~150Hz cutoff depending on sample rate
        for (let i = skipBins; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        const averageVolume = sum / (bufferLength - skipBins);

        // Update store with audio level (throttled)
        frameCountRef.current += 1;
        if (frameCountRef.current % 4 === 0) {
            useStore.getState().setAudioLevel(averageVolume);
        }

        // Simple logging to debug (throttled)
        if (Math.random() < 0.02) {
             console.log("Audio Level:", Math.round(averageVolume), "Threshold:", SILENCE_THRESHOLD);
        }
        
        if (averageVolume > SILENCE_THRESHOLD) {
            // Noise detected, reset silence timer
            silenceStartRef.current = Date.now();
            hasSpokenRef.current = true;
        } else {
            // Silence detected
            if (hasSpokenRef.current && (Date.now() - silenceStartRef.current > SILENCE_DURATION)) {
                // Detected silence for long enough
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    mediaRecorderRef.current.stop(); // This triggers onstop
                }
                return; // Stop the loop
            }
        }
        
        animationFrameRef.current = requestAnimationFrame(detectSilence);
      };
      
      detectSilence();

    } catch (err: any) {
      console.error('Error starting recording:', err);
      setError('Microphone access denied or not available.');
    }
  }, [onFinished, cleanupAudioAnalysis]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }
      
      manualStopResolveRef.current = resolve;
      mediaRecorder.stop();
    });
  }, []);

  return { isRecording, startRecording, stopRecording, error };
}
