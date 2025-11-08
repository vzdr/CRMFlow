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
    <div className="absolute bottom-8 right-8 bg-surface p-6 rounded-xl shadow-2xl w-[450px] border border-border-color">
      <h3 className="text-xl font-bold mb-3">Voice Interaction Test</h3>
      <p className="text-base text-gray-300 min-h-[50px] italic">
        Transcript: {transcript || "..."}
      </p>
      <button
        onClick={handleToggleListen}
        className={`mt-4 w-full flex items-center justify-center p-4 rounded-lg text-white font-bold text-lg transition-colors ${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-indigo-500'}`}
      >
        {isListening ? <FaMicrophoneSlash className="mr-3" /> : <FaMicrophone className="mr-3" />}
        {isListening ? 'Stop Listening' : 'Start Voice Input'}
      </button>
    </div>
  );
}
