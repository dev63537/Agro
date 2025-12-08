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
    <div className="border p-2 bg-white">
      <SignaturePadLib ref={sigRef} penColor="black" canvasProps={{ width, height }} />
    </div>
  )
})

export default SignaturePad
