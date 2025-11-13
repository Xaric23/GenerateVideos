# Music Video Generator - Technical Documentation

## Architecture Overview

The Music Video Generator is built with a modular architecture consisting of four main components:

### 1. Music Generator (`src/musicGenerator.js`)
- **Purpose**: Synthesizes original music based on genre templates
- **Technology**: Tone.js with offline rendering
- **Process**:
  1. Generates a Tone.js script dynamically based on genre parameters
  2. Creates instruments (synth, bass, kick drum, hi-hat)
  3. Schedules notes and patterns synchronized to tempo
  4. Renders offline to WAV format
  5. Exports as 44.1kHz stereo audio

### 2. Visual Generator (`src/visualGenerator.js`)
- **Purpose**: Creates animated visual frames synchronized to music tempo
- **Technology**: Node Canvas API
- **Components**:
  - **Audio Visualizer**: Frequency bars that react to beats
  - **Particles**: Animated particles following circular paths
  - **Geometric Patterns**: Rotating shapes synced to tempo
  - **Intro/Outro**: Title cards with fade effects
- **Output**: PNG frames at 30 FPS, 1920x1080 resolution

### 3. Video Renderer (`src/videoRenderer.js`)
- **Purpose**: Combines audio and visual frames into final video
- **Technology**: FFmpeg via fluent-ffmpeg wrapper
- **Process**:
  1. Renders intro (3 seconds with silent audio)
  2. Renders main content (syncs frames with music)
  3. Renders outro (3 seconds with silent audio)
  4. Concatenates all segments into final MP4
  5. Applies H.264 encoding with AAC audio

### 4. Main Orchestrator (`generate.js`)
- **Purpose**: Coordinates the entire generation pipeline
- **Features**:
  - CLI interface with help and genre listing
  - Progress reporting and error handling
  - Temporary file management
  - Statistics calculation

## Genre Specifications

### Electronic (128 BPM)
- **Scale**: C major pentatonic
- **Colors**: Cyan, magenta, yellow, green
- **Style**: Geometric shapes, 50 particles
- **Character**: High-energy, synthetic

### Ambient (80 BPM)
- **Scale**: C major with extensions
- **Colors**: Blue, purple tones
- **Style**: Organic shapes, 30 particles
- **Character**: Slow, atmospheric

### Hip-Hop (90 BPM)
- **Scale**: C minor with blues notes
- **Colors**: Orange, yellow, red tones
- **Style**: Sharp geometric, 40 particles
- **Character**: Urban, rhythmic

### Pop (120 BPM)
- **Scale**: C major (full scale)
- **Colors**: Pink, rose tones
- **Style**: Round shapes, 60 particles
- **Character**: Catchy, upbeat

### Techno (140 BPM)
- **Scale**: C minor pentatonic
- **Colors**: Red, green, blue, white (RGB)
- **Style**: Geometric shapes, 70 particles
- **Character**: Fast, intense, electronic

## Generation Pipeline

```
1. Music Synthesis (Tone.js)
   ↓ WAV audio file
2. Visual Frame Generation (Canvas)
   ↓ Intro frames (PNG)
   ↓ Main frames (PNG, synced to tempo)
   ↓ Outro frames (PNG)
3. Video Rendering (FFmpeg)
   ↓ intro.mp4
   ↓ main.mp4 (with music)
   ↓ outro.mp4
4. Concatenation (FFmpeg)
   ↓ final_video.mp4
5. Cleanup
   ↓ Remove temporary files
```

## Performance Characteristics

### Typical Generation Time (3-minute video)
- Music synthesis: 10-30 seconds
- Visual generation: 5-10 minutes (5400 frames)
- Video rendering: 2-5 minutes
- **Total**: ~8-15 minutes

### Resource Usage
- **Memory**: ~500MB peak during frame generation
- **Disk**: ~100MB temporary files during generation
- **CPU**: High utilization during frame generation and encoding

### Output Specifications
- **Container**: MP4
- **Video Codec**: H.264 (libx264)
- **Audio Codec**: AAC
- **Resolution**: 1920x1080
- **Frame Rate**: 30 FPS
- **Audio**: 44.1kHz, stereo, 192 kbps
- **Typical File Size**: 10-50 MB for 3-5 minute video

## Security Features

### Path Sanitization
- All file paths are resolved to absolute paths using `path.resolve()`
- Prevents directory traversal attacks

### Process Isolation
- Uses `child_process.spawn()` instead of `exec()` to prevent command injection
- Arguments are passed as array elements, not concatenated strings

### Input Validation
- Genre names are validated against a whitelist
- Only supported genres are accepted

## Extensibility

### Adding New Genres

1. **Add to Music Generator** (`src/musicGenerator.js`):
```javascript
newgenre: {
  tempo: 100,
  scale: ['C4', 'D4', 'E4', ...],
  bassNotes: ['C2', 'F2', ...],
  chords: [
    ['C4', 'E4', 'G4'],
    ...
  ],
  duration: { min: 180, max: 300 }
}
```

2. **Add to Visual Generator** (`src/visualGenerator.js`):
```javascript
newgenre: {
  colors: ['#color1', '#color2', ...],
  backgroundColor: '#000000',
  shapeType: 'geometric',
  particleCount: 50,
  waveAmplitude: 100
}
```

3. **Update Documentation** in README.md and help text

### Customizing Visual Effects

Edit `src/visualGenerator.js`:
- `_drawVisualizer()`: Modify frequency bar visualization
- `_drawParticles()`: Change particle animation behavior
- `_drawGeometricPatterns()`: Alter shape animations

### Adjusting Video Quality

Edit `src/videoRenderer.js` output options:
- Change CRF value (23 = default, lower = higher quality)
- Modify preset (ultrafast, fast, medium, slow, veryslow)
- Adjust audio bitrate

## Dependencies

### Core Dependencies
- **tone**: ^14.7.77 - Music synthesis
- **canvas**: ^2.11.2 - Visual generation
- **fluent-ffmpeg**: ^2.1.2 - Video encoding
- **cli-progress**: ^3.12.0 - Progress bars (currently unused)

### System Requirements
- **Node.js**: v14 or higher
- **FFmpeg**: Latest version with H.264 and AAC support
- **Memory**: Minimum 1GB RAM
- **Disk**: 500MB free space

## Error Handling

### Common Errors

**FFmpeg not found**
- Solution: Install FFmpeg and add to system PATH

**Canvas build errors**
- Solution: Install system dependencies (cairo, pango, etc.)

**Out of memory**
- Solution: Close other applications or reduce video duration

**Permission denied**
- Solution: Ensure write permissions in output directory

## Future Enhancements

- [ ] Real-time preview during generation
- [ ] Custom template support via JSON configuration
- [ ] Additional visual effects (3D, particles systems)
- [ ] Audio effect chains (reverb, delay, compression)
- [ ] Batch generation mode
- [ ] Web-based UI
- [ ] GPU acceleration for rendering
- [ ] More music genres (jazz, classical, rock, etc.)
- [ ] Text overlay and lyric support
- [ ] Custom color schemes
- [ ] Export to multiple resolutions/formats
