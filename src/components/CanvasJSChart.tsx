import React, { useEffect, useRef } from 'react';
import CanvasJS from '@canvasjs/charts';

export default function CanvasJSChart({ options, containerProps }: { options: any, containerProps?: React.CSSProperties }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (containerRef.current) {
      chartRef.current = new CanvasJS.Chart(containerRef.current, options);
      chartRef.current.render();
    }
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.options = options;
      chartRef.current.render();
    }
  }, [options]);

  const style = containerProps ? { ...containerProps } : { width: '100%', position: 'relative' };
  style.height = (containerProps as any)?.height || options?.height || '400px';

  return <div ref={containerRef} style={style as React.CSSProperties} />;
}
