import React, { useRef, forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import SignaturePadLib from 'react-signature-canvas';

const SignaturePad = forwardRef((props, ref) => {
  const sigRef = useRef(null);
  const containerRef = useRef(null);
  const [width, setWidth] = useState(400);

  useImperativeHandle(ref, () => ({
    getDataURL: () => {
      if (!sigRef.current || sigRef.current.isEmpty()) return null;
      return sigRef.current.getTrimmedCanvas().toDataURL('image/png');
    },
    clear: () => sigRef.current && sigRef.current.clear(),
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // Adjust for any border/padding in the container
        const newWidth = Math.max(280, entry.contentRect.width);
        setWidth(newWidth);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="space-y-2" ref={containerRef}>
      <div className="border-2 border-dashed border-surface-300 rounded-xl p-1 bg-white hover:border-primary-300 transition-colors">
        <SignaturePadLib
          ref={sigRef}
          penColor="#1b5e20"
          canvasProps={{
            width: width - 10, // Buffer for internal padding
            height: 150,
            className: 'rounded-lg block touch-none cursor-crosshair'
          }}
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-secondary-400">Sign above using mouse or touch</p>
        <button
          type="button"
          onClick={() => sigRef.current?.clear()}
          className="btn btn-sm btn-ghost text-secondary-500 min-h-[36px] px-3 flex items-center justify-center"
        >
          🔄 Clear
        </button>
      </div>
    </div>
  );
});

export default SignaturePad;
