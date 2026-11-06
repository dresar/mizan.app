import React, { useEffect, useRef } from "react";

interface MermaidProps {
  chart: string;
  id?: string;
}

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    if (ref.current && chart) {
      const renderChart = (m: any) => {
        if (!isMounted || !ref.current) return;
        m.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          fontFamily: "Inter, sans-serif",
          themeVariables: {
            primaryColor: "#0ea5e9",
            primaryTextColor: "#fff",
            primaryBorderColor: "#0ea5e9",
            lineColor: "#cbd5e1",
            secondaryColor: "#1e293b",
            tertiaryColor: "#334155",
          },
        });
        ref.current.removeAttribute("data-processed");
        if (typeof m.run === "function") {
          m.run({ nodes: [ref.current] }).catch((e: any) => console.error(e));
        } else if (typeof m.contentLoaded === "function") {
          m.contentLoaded();
        }
      };

      if ((window as any).mermaid) {
        renderChart((window as any).mermaid);
      } else {
        const scriptId = "mermaid-cdn-script";
        let script = document.getElementById(scriptId) as HTMLScriptElement;
        if (!script) {
          script = document.createElement("script");
          script.id = scriptId;
          script.src = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
          script.async = true;
          document.head.appendChild(script);
        }
        script.addEventListener("load", () => {
          if ((window as any).mermaid) {
            renderChart((window as any).mermaid);
          }
        });
      }
    }
    return () => {
      isMounted = false;
    };
  }, [chart]);

  return (
    <div className="mermaid-wrapper flex justify-center bg-muted/30 p-4 rounded-xl border overflow-auto min-h-[300px]">
      <div key={chart} className="mermaid" ref={ref}>
        {chart}
      </div>
    </div>
  );
};

export default Mermaid;
