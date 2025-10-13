"use client";
import AuthGuard from "../components/AuthGuard";
import styles from "./chat.module.css";
import { ChatInterface } from "./v0/chat-interface";

export default function ChatPage() {
  return (
    <AuthGuard>
      <div
        className={"dark " + styles.v0ChatWrapper + " " + styles.fillViewport}
      >
        <ChatInterface />
      </div>
    </AuthGuard>
  );
}
