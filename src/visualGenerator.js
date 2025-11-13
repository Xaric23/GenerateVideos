const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

/**
 * Visual Generator Module
 * Generates animated visuals synchronized to music tempo
 */

class VisualGenerator {
  constructor() {
    this.width = 1920;
    this.height = 1080;
    this.fps = 30;
  }

  /**
   * Generate visual frames for the music video
   * @param {Object} musicMetadata - Metadata from music generation
   * @param {string} outputDir - Directory to save frames
   * @returns {Promise<Object>} Visual metadata
   */
  async generateVisuals(musicMetadata, outputDir) {
    const { tempo, duration, genre } = musicMetadata;
    const totalFrames = Math.floor(duration * this.fps);
    const beatsPerSecond = tempo / 60;
    
    console.log(`Generating ${totalFrames} frames for ${genre} visuals...`);
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const visualStyle = this._getVisualStyle(genre);
    
    // Generate frames with progress reporting
    const progressInterval = Math.floor(totalFrames / 20) || 1;
    
    for (let frameNum = 0; frameNum < totalFrames; frameNum++) {
      const time = frameNum / this.fps;
      const beat = time * beatsPerSecond;
      
      await this._generateFrame(frameNum, beat, time, duration, visualStyle, outputDir);
      
      if (frameNum % progressInterval === 0) {
        const progress = ((frameNum / totalFrames) * 100).toFixed(1);
        console.log(`  Frame generation progress: ${progress}%`);
      }
    }
    
    console.log('  Frame generation progress: 100.0%');
    
    return {
      frameCount: totalFrames,
      fps: this.fps,
      width: this.width,
      height: this.height,
      framesDir: outputDir
    };
  }

  /**
   * Generate intro frames
   */
  async generateIntro(genre, outputDir, durationSeconds = 3) {
    console.log(`Generating intro (${durationSeconds}s)...`);
    
    const totalFrames = Math.floor(durationSeconds * this.fps);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    for (let frameNum = 0; frameNum < totalFrames; frameNum++) {
      const progress = frameNum / totalFrames;
      await this._generateIntroFrame(frameNum, progress, genre, outputDir);
    }
    
    return {
      frameCount: totalFrames,
      fps: this.fps,
      width: this.width,
      height: this.height,
      framesDir: outputDir
    };
  }

  /**
   * Generate outro frames
   */
  async generateOutro(genre, outputDir, durationSeconds = 3) {
    console.log(`Generating outro (${durationSeconds}s)...`);
    
    const totalFrames = Math.floor(durationSeconds * this.fps);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    for (let frameNum = 0; frameNum < totalFrames; frameNum++) {
      const progress = frameNum / totalFrames;
      await this._generateOutroFrame(frameNum, progress, genre, outputDir);
    }
    
    return {
      frameCount: totalFrames,
      fps: this.fps,
      width: this.width,
      height: this.height,
      framesDir: outputDir
    };
  }

  /**
   * Get visual style based on genre
   */
  _getVisualStyle(genre) {
    const styles = {
      electronic: {
        colors: ['#00ffff', '#ff00ff', '#ffff00', '#00ff00'],
        backgroundColor: '#000000',
        shapeType: 'geometric',
        particleCount: 50,
        waveAmplitude: 100
      },
      ambient: {
        colors: ['#4a90e2', '#7b68ee', '#9370db', '#ba55d3'],
        backgroundColor: '#0a0a1a',
        shapeType: 'organic',
        particleCount: 30,
        waveAmplitude: 150
      },
      hiphop: {
        colors: ['#ff4500', '#ffa500', '#ffff00', '#ff6347'],
        backgroundColor: '#1a1a1a',
        shapeType: 'sharp',
        particleCount: 40,
        waveAmplitude: 80
      },
      pop: {
        colors: ['#ff1493', '#ff69b4', '#ffc0cb', '#ffb6c1'],
        backgroundColor: '#ffffff',
        shapeType: 'round',
        particleCount: 60,
        waveAmplitude: 120
      },
      techno: {
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffffff'],
        backgroundColor: '#000000',
        shapeType: 'geometric',
        particleCount: 70,
        waveAmplitude: 90
      }
    };
    
    return styles[genre] || styles.electronic;
  }

  /**
   * Generate a single frame
   */
  async _generateFrame(frameNum, beat, time, duration, style, outputDir) {
    const canvas = createCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = style.backgroundColor;
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Animated elements synchronized to beat
    const intensity = Math.sin(beat * Math.PI) * 0.5 + 0.5;
    
    // Draw visualizer bars (waveform simulation)
    this._drawVisualizer(ctx, beat, intensity, style);
    
    // Draw particles
    this._drawParticles(ctx, time, beat, style);
    
    // Draw geometric patterns
    this._drawGeometricPatterns(ctx, beat, style);
    
    // Save frame
    const paddedFrameNum = String(frameNum).padStart(6, '0');
    const framePath = path.join(outputDir, `frame_${paddedFrameNum}.png`);
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(framePath, buffer);
  }

  /**
   * Generate intro frame
   */
  async _generateIntroFrame(frameNum, progress, genre, outputDir) {
    const canvas = createCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d');
    
    // Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Fade in effect
    const opacity = Math.min(progress * 2, 1);
    
    // Title text
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const title = `${genre.toUpperCase()} MUSIC VIDEO`;
    ctx.fillText(title, this.width / 2, this.height / 2);
    
    // Subtitle
    ctx.font = '48px Arial';
    ctx.fillText('Generated by AI', this.width / 2, this.height / 2 + 100);
    ctx.restore();
    
    // Save frame
    const paddedFrameNum = String(frameNum).padStart(6, '0');
    const framePath = path.join(outputDir, `intro_${paddedFrameNum}.png`);
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(framePath, buffer);
  }

  /**
   * Generate outro frame
   */
  async _generateOutroFrame(frameNum, progress, genre, outputDir) {
    const canvas = createCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d');
    
    // Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Fade out effect
    const opacity = Math.max(1 - progress * 2, 0);
    
    // Credits text
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillText('THANK YOU', this.width / 2, this.height / 2 - 50);
    
    ctx.font = '48px Arial';
    ctx.fillText('FOR WATCHING', this.width / 2, this.height / 2 + 50);
    ctx.restore();
    
    // Save frame
    const paddedFrameNum = String(frameNum).padStart(6, '0');
    const framePath = path.join(outputDir, `outro_${paddedFrameNum}.png`);
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(framePath, buffer);
  }

  /**
   * Draw audio visualizer bars
   */
  _drawVisualizer(ctx, beat, intensity, style) {
    const barCount = 64;
    const barWidth = this.width / barCount;
    const centerY = this.height / 2;
    
    ctx.save();
    
    for (let i = 0; i < barCount; i++) {
      const frequency = i / barCount;
      const phase = beat + frequency * 4;
      const height = (Math.sin(phase * Math.PI) * 0.5 + 0.5) * style.waveAmplitude * intensity;
      
      const colorIndex = Math.floor((i / barCount) * style.colors.length);
      ctx.fillStyle = style.colors[colorIndex];
      
      const x = i * barWidth;
      const h = height * 2;
      
      ctx.fillRect(x, centerY - h, barWidth - 2, h * 2);
    }
    
    ctx.restore();
  }

  /**
   * Draw animated particles
   */
  _drawParticles(ctx, time, beat, style) {
    ctx.save();
    
    for (let i = 0; i < style.particleCount; i++) {
      const angle = (i / style.particleCount) * Math.PI * 2 + time * 0.5;
      const radius = 300 + Math.sin(beat + i) * 100;
      
      const x = this.width / 2 + Math.cos(angle) * radius;
      const y = this.height / 2 + Math.sin(angle) * radius;
      
      const size = 5 + Math.sin(beat * 2 + i) * 3;
      
      ctx.fillStyle = style.colors[i % style.colors.length];
      ctx.globalAlpha = 0.6;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  /**
   * Draw geometric patterns
   */
  _drawGeometricPatterns(ctx, beat, style) {
    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);
    
    const rotationSpeed = 0.5;
    const rotation = beat * rotationSpeed;
    
    // Draw rotating shapes
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.rotate(rotation + (i * Math.PI * 2 / 3));
      
      ctx.strokeStyle = style.colors[i % style.colors.length];
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.4;
      
      const size = 150 + i * 50;
      
      ctx.beginPath();
      if (style.shapeType === 'geometric') {
        // Hexagon
        for (let j = 0; j < 6; j++) {
          const angle = (j / 6) * Math.PI * 2;
          const x = Math.cos(angle) * size;
          const y = Math.sin(angle) * size;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
      } else {
        // Circle
        ctx.arc(0, 0, size, 0, Math.PI * 2);
      }
      
      ctx.stroke();
      ctx.restore();
    }
    
    ctx.restore();
  }
}

module.exports = VisualGenerator;
