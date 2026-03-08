"use client";

import { useGLTF, OrbitControls, Environment, Center, Bounds } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls, Leva, folder } from "leva";
import { ParameterFileData } from "@/types";
import { useEffect, useMemo } from "react";
import * as THREE from 'three';

function Model({ url, paramsData }: { url: string; paramsData: ParameterFileData | null }) {
  const { scene } = useGLTF(url);

  // Dynamically build Leva schema from JSON if it exists
  const schema = useMemo(() => {
    const s: Record<string, any> = {};
    if (!paramsData) return s;
    
    paramsData.parameters.forEach((param) => {
      s[param.name] = {
        value: param.value,
        min: param.min,
        max: param.max,
        step: param.type === 'slider' && param.max > 10 ? 1 : 0.1,
      };
    });
    return s;
  }, [paramsData]);

  // Hook into Leva
  const values = useControls(schema);

  // Update mesh when Leva values change AND override material
  useEffect(() => {
    if (!scene) return;

    // Get original baseline values if params exist
    const originalVals = new Map<string, number>();
    if (paramsData) {
      paramsData.parameters.forEach(p => originalVals.set(p.name, p.value));
    }

    // Simple traverse to apply scale according to sliders
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (paramsData) {
          if (values["width"]) {
            const orig = originalVals.get("width") || 1;
            mesh.scale.x = values["width"] / orig;
          }
          if (values["length"]) {
            const orig = originalVals.get("length") || 1;
            mesh.scale.z = values["length"] / orig;
          }
          if (values["floors"]) {
            const orig = originalVals.get("floors") || 1;
            mesh.scale.y = values["floors"] / orig;
          }
        }
      }
    });

  }, [scene, values, paramsData]);

  return <primitive object={scene} />;
}

export default function Viewer({ glbUrl, initialParams }: { glbUrl: string; initialParams: ParameterFileData | null }) {
  const { showGrid } = useControls({
    "Display": folder({
      showGrid: { value: true, label: "Show Grid" }
    })
  });

  return (
    <>
      <div style={{ position: 'absolute', top: '90px', right: '20px', zIndex: 50 }}>
        <Leva 
          fill
            theme={{
            colors: {
              elevation1: '#ffffff', // white background
              elevation2: '#f1f5f9', // slate-100 accents
              elevation3: '#e2e8f0', // slate-200
              accent1: '#4f46e5', // indigo-600
              accent2: '#4338ca', // indigo-700
              accent3: '#6366f1', // indigo-500
              highlight1: '#475569', // slate-600
              highlight2: '#334155', // slate-700
              highlight3: '#1e293b', // slate-800
              vivid1: '#eab308',     // yellow-500
              folderWidgetColor: '#4f46e5',
              folderTextColor: '#0f172a', // slate-900 absolute high contrast
              toolTipBackground: '#1e293b',
              toolTipText: '#f8fafc'
            },
            radii: {
              xs: '2px',
              sm: '4px',
              lg: '12px',
            },
            borderWidths: {
              hover: '1px',
              active: '2px',
            },
            shadows: {
              level1: '0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5)',
              level2: '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5)',
            }
          }}
        />
      </div>
      <Canvas camera={{ position: [20, 20, 20], fov: 50 }}>
        {/* Transparent background (no <color attach="background" />) */}
        
        {/* Lighting Setup */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 5]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
        <Environment preset="city" />
        
        {/* Interactive Controls */}
        <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} />

        {/* 3D Model Instance (Auto-Centered and Framed) */}
        <Bounds fit clip observe margin={1.2}>
          <Center top>
            <Model url={glbUrl} paramsData={initialParams} />
          </Center>
        </Bounds>
        
        {/* Axes and Grid for debugging Grasshopper exports */}
        {showGrid && (
          <>
            <axesHelper args={[50]} />
            <gridHelper args={[200, 200, 0x6366f1, 0xe2e8f0]} />
          </>
        )}
      </Canvas>
    </>
  );
}
