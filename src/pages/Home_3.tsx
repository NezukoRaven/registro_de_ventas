import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Settings, X } from 'lucide-react';

const Home = () => {
  const [numBalls, setNumBalls] = useState('');
  const [speed, setSpeed] = useState('');
  const [lineColor, setLineColor] = useState('#666666');
  const [maxDistance, setMaxDistance] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [balls, setBalls] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const initializeBalls = () => {
      if (!numBalls || !speed) return;
      
      const newBalls = [];
      for (let i = 0; i < Number(numBalls); i++) {
        newBalls.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          dx: (Math.random() - 0.5) * Number(speed),
          dy: (Math.random() - 0.5) * Number(speed),
          radius: 4
        });
      }
      setBalls(newBalls);
    };

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeBalls();
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [numBalls, speed, isRunning]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const currentMaxDistance = Number(maxDistance) || 100;

    const animate = () => {
      if (!isRunning) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const updatedBalls = balls.map(ball => {
        let newX = ball.x + ball.dx * Number(speed);
        let newY = ball.y + ball.dy * Number(speed);
        let newDx = ball.dx;
        let newDy = ball.dy;

        if (newX < ball.radius || newX > canvas.width - ball.radius) newDx = -newDx;
        if (newY < ball.radius || newY > canvas.height - ball.radius) newDy = -newDy;

        return {
          ...ball,
          x: newX < ball.radius ? ball.radius : newX > canvas.width - ball.radius ? canvas.width - ball.radius : newX,
          y: newY < ball.radius ? ball.radius : newY > canvas.height - ball.radius ? canvas.height - ball.radius : newY,
          dx: newDx,
          dy: newDy
        };
      });

      for (let i = 0; i < updatedBalls.length; i++) {
        for (let j = i + 1; j < updatedBalls.length; j++) {
          const dx = updatedBalls[i].x - updatedBalls[j].x;
          const dy = updatedBalls[i].y - updatedBalls[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < currentMaxDistance) {
            const opacity = (1 - distance / currentMaxDistance) * 0.5;
            ctx.beginPath();
            ctx.strokeStyle = `${lineColor}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
            ctx.moveTo(updatedBalls[i].x, updatedBalls[i].y);
            ctx.lineTo(updatedBalls[j].x, updatedBalls[j].y);
            ctx.stroke();
          }
        }
      }

      updatedBalls.forEach(ball => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
      });

      setBalls(updatedBalls);
      animationRef.current = requestAnimationFrame(animate);
    };

    if (isRunning) {
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [balls, speed, lineColor, isRunning, maxDistance]);

  const handleStart = () => {
    if (!numBalls || !speed) {
      alert('Por favor, ingresa la cantidad de bolas y la velocidad');
      return;
    }
    setIsRunning(!isRunning);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />
      
      {/* Botón flotante para mostrar/ocultar menú */}
      <Button
        onClick={() => setShowMenu(!showMenu)}
        className="absolute top-4 right-4 z-50 rounded-full w-10 h-10 p-0"
        variant="outline"
      >
        {showMenu ? <X size={20} /> : <Settings size={20} />}
      </Button>
      
      {/* Panel de control con animación de transición */}
      <div className={`absolute top-16 right-4 transition-all duration-300 ease-in-out transform ${
        showMenu ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <Card className="p-4 bg-white/80 backdrop-blur-sm shadow-lg rounded-lg">
          <div className="space-y-4">
            <div>
              <Label htmlFor="numBalls">Cantidad de bolas</Label>
              <Input
                id="numBalls"
                type="number"
                min="1"
                max="100"
                value={numBalls}
                onChange={(e) => setNumBalls(e.target.value)}
                className="w-full"
                placeholder="Cantidad"
              />
            </div>
            <div>
              <Label htmlFor="speed">Velocidad</Label>
              <Input
                id="speed"
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(e.target.value)}
                className="w-full"
                placeholder="Velocidad"
              />
            </div>
            <div>
              <Label htmlFor="maxDistance">Distancia de conexión</Label>
              <Input
                id="maxDistance"
                type="number"
                min="10"
                max="300"
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                className="w-full"
                placeholder="Distancia (px)"
              />
            </div>
            <div>
              <Label htmlFor="lineColor">Color de líneas</Label>
              <Input
                id="lineColor"
                type="color"
                value={lineColor}
                onChange={(e) => setLineColor(e.target.value)}
                className="w-full h-9"
              />
            </div>
            <Button 
              onClick={handleStart} 
              className="w-full"
              variant={isRunning ? "destructive" : "default"}
            >
              {isRunning ? 'Detener' : 'Iniciar'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Home;
