"use client";

import { useState } from "react";
import UploadArea from "@/components/UploadArea";
import Viewer from "@/components/Viewer";
import { ParameterFileData } from "@/types";
import { RotateCcw, Box } from "lucide-react";

export default function Home() {
  const [glbFileUrl, setGlbFileUrl] = useState<string | null>(null);
  const [paramsData, setParamsData] = useState<ParameterFileData | null>(null);

  const handleUpload = (glbBlobUrl: string, params: ParameterFileData | null) => {
    setGlbFileUrl(glbBlobUrl);
    setParamsData(params);
  };

  const reset = () => {
    setGlbFileUrl(null);
    setParamsData(null);
  };

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 bg-grid-pattern relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />

      <header className="fixed top-0 w-full px-6 py-4 glass-panel border-b-0 border-slate-200 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Box className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-heading text-gradient tracking-tight">SwaReka</h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase mt-0.5">Parametric Configurator</p>
          </div>
        </div>
        {glbFileUrl && (
          <button 
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white text-slate-700 hover:text-indigo-600 border border-slate-200 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-indigo-500/10"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Viewer</span>
          </button>
        )}
      </header>

      <div className="flex-1 w-full h-screen relative z-10 pt-[76px]">
        {!glbFileUrl ? (
          <div className="flex flex-col items-center justify-center h-full px-6 pb-20">
            <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight font-heading">
                Parametric Architecture,<br/>
                <span className="text-gradient">Visualized instantly.</span>
              </h2>
              <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto font-light">
                Bring your Grasshopper models to life in the browser. Upload your `.glb` and parameters to configure the structure in real-time.
              </p>
            </div>
            <UploadArea onUpload={handleUpload} />
          </div>
        ) : (
          <div className="absolute inset-0 pt-[76px] w-full h-full animate-in fade-in duration-1000 bg-slate-50/50 backdrop-blur-sm">
            <Viewer glbUrl={glbFileUrl} initialParams={paramsData} />
          </div>
        )}
      </div>
    </main>
  );
}
