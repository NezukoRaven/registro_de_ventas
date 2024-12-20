import React, { useState, useEffect, useRef } from 'react';
import { Settings, ChevronLeft, ChevronRight } from 'lucide-react';

const Home = () => {
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const [staticPoints, setStaticPoints] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [config, setConfig] = useState({
    numPoints: 20,
    connectionDistance: 200,
    pointSize: 3,
    cursorSize: 8,
    color: '#64CCFF',
    glowIntensity: 10
  });
  const canvasRef = useRef(null);

  // Initialize static points
  useEffect(() => {
    const generatePoints = () => {
      const points = [];
      const margin = 50;
      
      for (let i = 0; i < config.numPoints; i++) {
        points.push({
          x: margin + Math.random() * (window.innerWidth - 2 * margin),
          y: margin + Math.random() * (window.innerHeight - 2 * margin),
        });
      }
      return points;
    };

    setStaticPoints(generatePoints());
    setPointerPos({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    });
  }, [config.numPoints]);

  // Handle events and animation (previous event handling code remains the same)
  useEffect(() => {
    const canvas = canvasRef.current;

    const handleMove = (e) => {
      e.preventDefault();
      const pos = getPointerPosition(e);
      setPointerPos(pos);
    };

    const getPointerPosition = (e) => {
      const rect = canvas.getBoundingClientRect();
      const event = e.touches ? e.touches[0] : e;
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    canvas.addEventListener('touchstart', handleMove, { passive: false });

    return () => {
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('touchmove', handleMove);
      canvas.removeEventListener('touchstart', handleMove);
    };
  }, []);

  // Animation code
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();

    const drawCurvedLine = (startX, startY, endX, endY) => {
      const distance = Math.hypot(endX - startX, endY - startY);
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      const wave = Math.sin(Date.now() / 1000) * (distance * 0.1);
      const controlX = midX - wave;
      const controlY = midY + wave;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(controlX, controlY, endX, endY);
      ctx.stroke();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      staticPoints.forEach(point => {
        const distance = Math.hypot(point.x - pointerPos.x, point.y - pointerPos.y);
        if (distance < config.connectionDistance) {
          ctx.strokeStyle = `${config.color}${Math.floor((1 - distance/config.connectionDistance) * 255).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = 2;
          ctx.shadowColor = config.color;
          ctx.shadowBlur = config.glowIntensity;
          drawCurvedLine(pointerPos.x, pointerPos.y, point.x, point.y);
        }
      });

      // Draw static points
      staticPoints.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, config.pointSize, 0, Math.PI * 2);
        ctx.fillStyle = config.color;
        ctx.fill();
      });

      // Draw cursor point
      ctx.beginPath();
      ctx.arc(pointerPos.x, pointerPos.y, config.cursorSize, 0, Math.PI * 2);
      ctx.fillStyle = config.color;
      ctx.shadowColor = config.color;
      ctx.shadowBlur = config.glowIntensity * 1.5;
      ctx.fill();

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [pointerPos, staticPoints, config]);

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="fixed inset-0 overflow-hidden touch-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
      
      {/* Control Panel Toggle Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed top-4 right-4 p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition-all z-50"
      >
        {isMenuOpen ? <ChevronRight /> : <Settings />}
      </button>

      {/* Control Panel */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-gray-900/90 backdrop-blur-sm text-white p-4 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="space-y-6 mt-12">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Color</label>
            <input
              type="color"
              value={config.color}
              onChange={(e) => handleConfigChange('color', e.target.value)}
              className="w-full h-8 bg-transparent rounded cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Número de Puntos</label>
            <input
              type="range"
              min="5"
              max="50"
              value={config.numPoints}
              onChange={(e) => handleConfigChange('numPoints', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-right text-sm">{config.numPoints}</div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Distancia de Conexión</label>
            <input
              type="range"
              min="50"
              max="400"
              value={config.connectionDistance}
              onChange={(e) => handleConfigChange('connectionDistance', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-right text-sm">{config.connectionDistance}px</div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Tamaño de Puntos</label>
            <input
              type="range"
              min="1"
              max="10"
              value={config.pointSize}
              onChange={(e) => handleConfigChange('pointSize', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-right text-sm">{config.pointSize}px</div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Intensidad del Brillo</label>
            <input
              type="range"
              min="0"
              max="20"
              value={config.glowIntensity}
              onChange={(e) => handleConfigChange('glowIntensity', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-right text-sm">{config.glowIntensity}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
