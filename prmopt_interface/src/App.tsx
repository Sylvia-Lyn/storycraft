import { useState } from "react";
import { PromptConfigManager } from "./components/PromptConfigManager";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="mb-8">提示词配置后台</h1>
        <PromptConfigManager />
      </div>
    </div>
  );
}