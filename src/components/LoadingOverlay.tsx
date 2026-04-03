import React from 'react';

/**
 * LoadingOverlay.tsx
 * STUNNING Global ZenSar Elite Loader
 * Features: Liquid Text Effect, Animated SVG Swoosh, Glassmorphism.
 */
const LoadingOverlay = ({ active, text = 'Syncing data...' }: { active: boolean; text?: string }) => {
  if (!active) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(8, 12, 22, 0.95)', backdropFilter: 'blur(15px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999, overflow: 'hidden'
    }}>
      
      {/* Background Pulsing Orbs for Depth */}
      <div style={{ position: 'absolute', top: '30%', left: '40%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'float 6s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '35%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'float 8s ease-in-out infinite' }} />

      <div style={{ position: 'relative', textAlign: 'center', display:'flex', flexDirection:'column', alignItems:'center' }}>
        
        {/* The Animated Swoosh SVG */}
        <svg width="240" height="120" style={{ position: 'absolute', top: -30, left: -20, pointerEvents: 'none', overflow: 'visible', zIndex: 1 }}>
          <path 
            d="M 10,60 Q 120,5 230,60" 
            fill="none" 
            stroke="rgba(239, 68, 68, 0.6)" 
            strokeWidth="3" 
            strokeLinecap="round"
            style={{ strokeDasharray: '300', strokeDashoffset: '300', animation: 'swooshFlow 2s ease-in-out infinite' }}
          />
        </svg>

        {/* Liquid ZenSar Text */}
        <h1 
          style={{ 
            fontSize: 72, fontWeight: 900, margin: 0, 
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            letterSpacing: -2.5,
            color: 'transparent',
            WebkitBackgroundClip: 'text',
            backgroundImage: 'linear-gradient(270deg, #fff 20%, #3B82F6 40%, #8B5CF6 60%, #fff 80%)',
            backgroundSize: '400% 100%',
            animation: 'liquidFlow 3s linear infinite',
            position: 'relative'
          }}
        >
          ZenSar
        </h1>

        {/* Subtitle / Status */}
        <div style={{ marginTop: 12, display:'flex', flexDirection:'column', gap: 4 }}>
           <div style={{ fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: 5, textTransform: 'uppercase' }}>
             Quality Engineering
           </div>
           <div style={{ 
              fontSize: 10, fontWeight: 700, color: '#3B82F6', marginTop: 12, 
              background: 'rgba(59,130,246,0.1)', padding: '4px 16px', borderRadius: 20,
              border: '1px solid rgba(59,130,246,0.2)', animation: 'pulse 1.5s infinite' 
           }}>
             {text.toUpperCase()}
           </div>
        </div>
      </div>

      <style>{`
        @keyframes liquidFlow {
          0% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes swooshFlow {
          0% { stroke-dashoffset: 300; opacity: 0; }
          40% { stroke-dashoffset: 0; opacity: 1; }
          60% { stroke-dashoffset: 0; opacity: 1; }
          100% { stroke-dashoffset: -300; opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.98); }
        }
      `}</style>
    </div>
  );
};

export default LoadingOverlay;
