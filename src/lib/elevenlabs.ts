export const speakText = async (text: string, voiceId: string = '21m00Tcm4lcv85ieWG7s') => {
  try {
    const response = await fetch('/api/speak', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, voiceId }),
    });

    if (!response.ok) {
      throw new Error('Failed to synthesize speech');
    }

    // The response is an audio blob (the actual sound file)
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    // Play the audio
    await audio.play();

    // Clean up memory after playing
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };

    return true;
  } catch (error) {
    console.error('ElevenLabs Error:', error);
    return false;
  }
};