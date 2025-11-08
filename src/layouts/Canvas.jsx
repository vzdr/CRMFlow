import VoiceController from '../components/VoiceController';

export default function Canvas() {
  return (
    <main className="flex-grow h-full grid-background relative">
      <div className="absolute top-4 left-4 bg-surface p-2 rounded-md">
          <h1 className="text-2xl font-bold">Project Flow</h1>
      </div>
      <VoiceController />
    </main>
  );
}
