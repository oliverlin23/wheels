type SpriteProps = {
  src: string
  frame: { x: number; y: number; w: number; h: number }
  style?: React.CSSProperties
}

export function Sprite({ src, frame, style }: SpriteProps) {
  return (
    <div
      style={{
        width: frame.w,
        height: frame.h,
        backgroundImage: `url(${src})`,
        backgroundPosition: `-${frame.x}px -${frame.y}px`,
        imageRendering: 'pixelated' as const,
        ...style,
      }}
    />
  )
}
