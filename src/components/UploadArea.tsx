"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileJson, Box } from "lucide-react";
import { ParameterFileData } from "@/types";

interface UploadAreaProps {
  onUpload: (glbBlobUrl: string, params: ParameterFileData | null) => void;
}

export default function UploadArea({ onUpload }: UploadAreaProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filesLoaded, setFilesLoaded] = useState<{ glb: boolean; json: boolean }>({ glb: false, json: false });

  const glbRef = useRef<File | null>(null);
  const jsonRef = useRef<File | null>(null);

  const processFiles = async (files: FileList | File[]) => {
    setError(null);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.endsWith(".glb")) {
        glbRef.current = file;
      } else if (file.name.endsWith(".json")) {
        jsonRef.current = file;
      }
    }

    setFilesLoaded({
      glb: !!glbRef.current,
      json: !!jsonRef.current,
    });

    if (glbRef.current) {
      if (jsonRef.current) {
        try {
          const text = await jsonRef.current.text();
          const json = JSON.parse(text) as ParameterFileData;
          if (!json.parameters) {
            setError("Invalid JSON: 'parameters' array missing.");
            return;
          }
          setTimeout(() => {
              const glbUrl = URL.createObjectURL(glbRef.current!);
              onUpload(glbUrl, json);
          }, 500);
        } catch (e) {
          setError("Error parsing JSON file. Make sure it's valid JSON.");
        }
      } else {
        // Just upload GLB so the user can test the Grasshopper export
        setTimeout(() => {
            const glbUrl = URL.createObjectURL(glbRef.current!);
            onUpload(glbUrl, null);
        }, 500);
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="glass-panel rounded-3xl p-8 relative overflow-hidden group">
        
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 opacity-50 group-hover:opacity-100" />

        <div 
          className={`relative z-10 flex flex-col items-center justify-center w-full h-80 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer bg-white/50
            ${isDragActive 
              ? "border-indigo-400 bg-indigo-50/80 scale-[1.02]" 
              : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50/80"}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <div className={`p-5 rounded-full mb-6 transition-all duration-500 ${isDragActive ? 'bg-indigo-100 text-indigo-600 scale-110' : 'bg-slate-100 text-slate-500'}`}>
            <UploadCloud className="w-10 h-10" />
          </div>
          
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            Upload your project files
          </h3>
          <p className="text-sm text-slate-500 text-center max-w-sm">
            Drag and drop your Grasshopper exports. We need both the 3D model and its parametric constraints.
          </p>

          <div className="mt-8 flex items-center justify-center gap-6">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${filesLoaded.glb ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-slate-200 text-slate-500 shadow-sm'}`}>
              <Box className="w-4 h-4" />
              <span className="text-sm font-medium">model.glb (Required)</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${filesLoaded.json ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-slate-200 text-slate-500 shadow-sm'}`}>
              <FileJson className="w-4 h-4" />
              <span className="text-sm font-medium">params.json (Optional)</span>
            </div>
          </div>
          
          <input 
            id="file-upload" 
            type="file" 
            multiple 
            accept=".glb,.json" 
            className="hidden" 
            onChange={handleChange} 
          />
        </div>
      </div>

      {error && (
        <div className="mt-6 text-center animate-in fade-in slide-in-from-top-2">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm font-medium text-red-400">
             {error}
          </span>
        </div>
      )}
    </div>
  );
}
