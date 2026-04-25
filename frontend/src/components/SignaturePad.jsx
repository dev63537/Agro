import React, { useRef, forwardRef, useImperativeHandle } from 'react'
import SignaturePadLib from 'react-signature-canvas'

const SignaturePad = forwardRef(({ width = 400, height = 150 }, ref) => {
  const sigRef = useRef(null)

  useImperativeHandle(ref, () => ({
    getDataURL: () => {
      if (!sigRef.current) return null
      return sigRef.current.getTrimmedCanvas().toDataURL('image/png')
    },
    clear: () => sigRef.current && sigRef.current.clear()
  }))

  return (
    <div className="space-y-2">
      <div className="border-2 border-dashed border-surface-300 rounded-xl p-1 bg-white hover:border-primary-300 transition-colors">
        <SignaturePadLib
          ref={sigRef}
          penColor="#1b5e20"
          canvasProps={{
            width,
            height,
            className: 'rounded-lg w-full'
          }}
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-secondary-400">Sign above using mouse or touch</p>
        <button
          type="button"
          onClick={() => sigRef.current?.clear()}
          className="btn btn-sm btn-ghost text-secondary-500"
        >
          🔄 Clear
        </button>
      </div>
    </div>
  )
})

export default SignaturePad
