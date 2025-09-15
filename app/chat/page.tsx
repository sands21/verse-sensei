import ChatScreen from "./ChatScreen";
import SignOutButton from "../components/SignOutButton";
import SelectionPanel from "../components/SelectionPanel";

export default function ChatPage() {
  return (
    <div className="min-h-[80vh] max-w-2xl mx-auto w-full p-6 flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Chat</h1>
        <span className="text-xs text-white/50">/chat</span>
        <SignOutButton />
      </header>
      <div className="w-full max-w-2xl mx-auto">
        <SelectionPanel />
      </div>
      <ChatScreen />
    </div>
  );
}
