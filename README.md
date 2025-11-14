# Music Video Generator 🎵🎬

A Node.js application that generates complete music videos (3-5 minutes) with synthesized music and animated visuals, ready for YouTube upload.

## Features

- **Procedural Music Generation**: Synthesizes original music using Tone.js based on genre templates
- **Animated Visuals**: Creates motion graphics and visualizations synchronized to the music's tempo
- **Multiple Genres**: Supports Electronic, Ambient, Hip-Hop, Pop, and Techno music styles
- **Intro/Outro**: Automatically adds professional intro and outro sections
- **YouTube Ready**: Exports as 1920x1080 MP4 files optimized for YouTube
- **Pure JavaScript**: Built entirely with Node.js and JavaScript libraries

## Prerequisites

- Node.js (v14 or higher, v18 LTS recommended for Windows users)
- FFmpeg (for video rendering)
- **Windows Only**: Visual Studio Build Tools (see Windows-specific instructions below)

### Installing FFmpeg

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH

### Windows-Specific Prerequisites

The `canvas` package requires native compilation on Windows. You have two options:

#### Option 1: Install Visual Studio Build Tools (Recommended)
1. Download and install [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
2. During installation, select the "Desktop development with C++" workload
3. This includes:
   - MSVC C++ build tools
   - Windows SDK
   - C++ CMake tools

#### Option 2: Use an Older Node.js Version
If you prefer not to install Visual Studio Build Tools:
1. Uninstall Node.js v22.x
2. Install [Node.js v18 LTS](https://nodejs.org/) which has better pre-built binary support
3. Pre-built binaries for canvas are more widely available for LTS versions

## Installation

1. Clone this repository:
```bash
git clone https://github.com/Xaric23/GenerateVideos.git
cd GenerateVideos
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Basic Usage

Generate a music video with default settings (electronic genre):
```bash
npm start
```

Or use the node command directly:
```bash
node generate.js
```

### Specify Genre

Generate a video for a specific genre:
```bash
node generate.js ambient
node generate.js hiphop
node generate.js pop
node generate.js electronic
node generate.js techno
```

### Custom Output Name

Specify a custom name for the output file:
```bash
node generate.js electronic my_awesome_video
```

### List Available Genres

```bash
npm run list
# or
node generate.js --list
```

### Help

```bash
npm run help
# or
node generate.js --help
```

## Available Genres

- **electronic**: High-energy electronic music with geometric visualizations (128 BPM)
- **ambient**: Slow, atmospheric soundscapes with organic visuals (80 BPM)
- **hiphop**: Urban beats with sharp, dynamic graphics (90 BPM)
- **pop**: Catchy, upbeat melodies with colorful round visuals (120 BPM)
- **techno**: Fast-paced techno with intense RGB visualizations (140 BPM)

## Output

Generated videos are saved to the `output/` directory with the following specifications:

- **Format**: MP4 (H.264 video, AAC audio)
- **Resolution**: 1920x1080 (Full HD)
- **Frame Rate**: 30 FPS
- **Duration**: 3-5 minutes (randomly selected within range)
- **Audio**: 44.1 kHz stereo, 192 kbps
- **Intro/Outro**: 3 seconds each

## How It Works

1. **Music Generation**: The script uses Tone.js to synthesize music offline, creating drums, bass, chords, and melodies based on genre-specific templates
2. **Visual Generation**: Canvas API generates animated frames synchronized to the music's tempo, including:
   - Audio visualizer bars
   - Animated particles
   - Rotating geometric patterns
   - Genre-specific color schemes
3. **Video Rendering**: FFmpeg combines the audio and visual frames into a complete video with intro and outro sections

## Project Structure

```
GenerateVideos/
├── generate.js              # Main orchestration script
├── src/
│   ├── musicGenerator.js    # Music synthesis module
│   ├── visualGenerator.js   # Visual generation module
│   └── videoRenderer.js     # Video rendering module
├── output/                  # Generated videos (created automatically)
├── package.json
└── README.md
```

## Performance Notes

- Generation time varies based on video duration (typically 5-15 minutes for a 3-5 minute video)
- Frame generation is the most time-consuming step
- Temporary files are automatically cleaned up after generation
- Required disk space: ~100MB per video during generation, ~10-50MB for final output

## Troubleshooting

**Error: FFmpeg not found**
- Install FFmpeg following the prerequisites section
- Ensure FFmpeg is in your system PATH

**Error: Canvas build failed (Windows)**

If you see errors about Visual Studio or missing build tools:

1. **Install Visual Studio Build Tools**:
   - Download [Visual Studio Build Tools 2022](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
   - Run the installer and select "Desktop development with C++" workload
   - Restart your terminal/command prompt after installation
   - Run `npm install` again

2. **Alternative: Use Node.js v18 LTS**:
   - Uninstall your current Node.js version
   - Install [Node.js v18 LTS](https://nodejs.org/) which has better pre-built binary support
   - Run `npm install` again

3. **If installation still fails**:
   - Delete `node_modules` folder and `package-lock.json`
   - Run `npm cache clean --force`
   - Run `npm install` again

**Error: Canvas build failed (Linux/macOS)**
- On Ubuntu/Debian: `sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev`
- On macOS: `brew install pkg-config cairo pango libpng jpeg giflib librsvg`

**Error: Cannot find module 'canvas'**
- This means dependencies are not installed
- Run `npm install` to install all required dependencies
- See troubleshooting above if npm install fails

**Out of memory errors**
- Close other applications to free up RAM
- Consider reducing video duration (modify genre templates in musicGenerator.js)

## License

ISC License - See LICENSE file for details

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## Future Enhancements

- Additional music genres
- Customizable video templates
- Text overlay support
- Audio effects and filters
- Real-time preview
- Batch generation
