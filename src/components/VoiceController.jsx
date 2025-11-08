import { useVoiceProcessor } from '../hooks/useVoiceProcessor';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

export default function VoiceController() {
  const { isListening, transcript, startListening, stopListening, speak } = useVoiceProcessor();

  const handleToggleListen = () => {
    if (isListening) {
      stopListening();
      // Mock AI response after a short delay to process
      if (transcript) {
         setTimeout(() => speak(`I understood you said: ${transcript}. This is where Gemini's response would go.`), 500);
      }
    } else {
      startListening();
    }
  };

  return (
    <div className="absolute bottom-10 right-10 bg-surface p-4 rounded-lg shadow-2xl w-96 border border-border-color">
      <h3 className="font-bold mb-2">Voice Interaction Test</h3>
      <p className="text-sm text-gray-400 min-h-[40px] italic">
        Transcript: {transcript || "..."}
      </p>
      <button
        onClick={handleToggleListen}
        className={`mt-4 w-full flex items-center justify-center p-3 rounded-md text-white font-bold transition-colors ${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-indigo-500'}`}
      >
        {isListening ? <FaMicrophoneSlash className="mr-2" /> : <FaMicrophone className="mr-2" />}
        {isListening ? 'Stop Listening' : 'Start Voice Input'}
      </button>
    </div>
  );
}
