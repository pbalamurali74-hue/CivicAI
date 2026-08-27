"use client";

import dynamic from "next/dynamic";

const InteractiveMap = dynamic(() => import("./InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-slate-900 animate-pulse rounded-xl flex items-center justify-center text-slate-400">
      Loading Leaflet Map Engine...
    </div>
  ),
});

export default InteractiveMap;
