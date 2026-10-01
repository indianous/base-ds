import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

interface QrCodeProps {
  value: string
  size?: number
  errorCorrection?: ErrorCorrectionLevel
  className?: string
  /** `aria-label` of the QR code image, from the encoded value. */
  label?: (value: string) => string
}

export function QrCode({
  value,
  size = 128,
  errorCorrection = 'M',
  className,
  label = (value) => `QR Code: ${value}`,
}: QrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        errorCorrectionLevel: errorCorrection,
      }).catch(console.error)
    }
  }, [value, size, errorCorrection])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      role="img"
      aria-label={label(value)}
      className={className}
    />
  )
}
