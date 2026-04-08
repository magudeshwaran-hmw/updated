import React from 'react';

interface ZensarLoaderProps {
  size?: number;
  fullScreen?: boolean;
  label?: string;
}

const ZensarLoader: React.FC<ZensarLoaderProps & { dark?: boolean }> = ({ size = 60, fullScreen = false, label, dark = false }) => {
  const containerStyle: React.CSSProperties = fullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: dark ? 'rgba(8, 12, 22, 0.98)' : 'rgba(255, 255, 255, 0.95)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(15px)',
  } : {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  };

  const innerBg = dark ? '#001A3D' : '#ffffff';
  const textColor = dark ? '#ffffff' : '#001A3D';

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes zensar-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes zensar-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.9); opacity: 0.8; }
        }
        .zensar-loader-circle {
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: conic-gradient(
            #E41E26, 
            #5C2D91, 
            #001A3D, 
            #E41E26
          );
          display: flex;
          align-items: center;
          justify-content: center;
          animation: zensar-rotate 2s linear infinite;
          position: relative;
          box-shadow: 0 10px 30px rgba(0,0,0,${dark ? 0.4 : 0.1});
        }
        .zensar-loader-inner {
          width: 85%;
          height: 85%;
          background: ${innerBg};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: zensar-rotate 2s linear infinite reverse;
        }
        .zensar-loader-z {
          width: 60%;
          height: 60%;
          color: #E41E26;
          animation: zensar-pulse 1.5s ease-in-out infinite;
        }
      `}</style>
      
      <div className="zensar-loader-circle">
        <div className="zensar-loader-inner">
          <svg className="zensar-loader-z" viewBox="0 0 100 100" fill="currentColor">
            <rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.2" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.2" />
            <path d="M25 25 L75 25 L25 75 L75 75" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      
      {label && (
        <div style={{ 
          marginTop: 20, 
          fontSize: 15, 
          fontWeight: 900, 
          color: dark ? '#FFFFFF' : '#001A3D', 
          textTransform: 'uppercase', 
          letterSpacing: 5,
          animation: 'zensar-pulse 1.4s ease-in-out infinite',
          textShadow: dark 
            ? '0 0 15px rgba(59,130,246,0.6), 0 0 25px rgba(59,130,246,0.2)' 
            : '0 1px 3px rgba(0,0,0,0.1)',
          opacity: 1
        }}>
          {label}
        </div>
      )}
    </div>
  );
};

export default ZensarLoader;
