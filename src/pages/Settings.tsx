
import React from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { SettingsForm } from "@/components/forms/SettingsForm";

const Settings = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <h1 className="mb-6 text-2xl font-bold">Settings</h1>
          <SettingsForm />
        </main>
      </div>
    </div>
  );
};

export default Settings;

