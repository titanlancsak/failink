export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink text-paper flex-col justify-between p-16 relative overflow-hidden">
        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              rgba(245,240,232,0.3) 2px,
              rgba(245,240,232,0.3) 4px
            )`,
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-accent flex items-center justify-center">
              <span className="text-paper font-display text-sm font-bold">A</span>
            </div>
            <span className="font-display text-xl tracking-wide">Agora</span>
          </div>
        </div>
        <div className="relative z-10">
          <blockquote className="font-display text-4xl leading-tight text-paper/90 mb-8">
            &ldquo;The marketplace of ideas begins with a single voice.&rdquo;
          </blockquote>
          <div className="w-12 h-px bg-accent mb-6" />
          <p className="text-paper/50 text-sm tracking-wide font-body">
            A space for thoughts, reactions, and real conversation.
          </p>
        </div>
        <div className="relative z-10">
          <p className="text-paper/30 text-xs tracking-widest uppercase font-display">
            &copy; {new Date().getFullYear()} Agora
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-12 lg:hidden">
            <div className="w-8 h-8 bg-accent flex items-center justify-center">
              <span className="text-paper font-display text-sm font-bold">A</span>
            </div>
            <span className="font-display text-xl tracking-wide text-ink">Agora</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
