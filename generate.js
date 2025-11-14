#!/usr/bin/env node

// Check if dependencies are installed
try {
  require.resolve('canvas');
  require.resolve('fluent-ffmpeg');
  require.resolve('tone');
} catch (error) {
  const isWindows = process.platform === 'win32';
  
  console.error('❌ Error: Required dependencies are not installed.');
  console.error('');
  console.error('Please run the following command to install dependencies:');
  console.error('  npm install');
  console.error('');
  
  if (isWindows) {
    console.error('⚠️  WINDOWS USERS: If npm install fails with canvas build errors:');
    console.error('');
    console.error('Option 1 (Recommended): Install Visual Studio Build Tools');
    console.error('  1. Download from: https://visualstudio.microsoft.com/downloads/');
    console.error('  2. Install "Desktop development with C++" workload');
    console.error('  3. Restart your terminal and run npm install again');
    console.error('');
    console.error('Option 2: Use Node.js v18 LTS (has better pre-built binary support)');
    console.error('  1. Download from: https://nodejs.org/');
    console.error('  2. Reinstall Node.js and run npm install again');
    console.error('');
  } else {
    console.error('If npm install fails, you may need to install system dependencies.');
    console.error('See the README.md for platform-specific instructions.');
    console.error('');
  }
  
  console.error('For detailed troubleshooting, see README.md');
  process.exit(1);
}

const fs = require('fs');
const path = require('path');
const MusicGenerator = require('./src/musicGenerator');
const VisualGenerator = require('./src/visualGenerator');
const VideoRenderer = require('./src/videoRenderer');

/**
 * Main Music Video Generator
 * Orchestrates music generation, visual generation, and video rendering
 */

class MusicVideoGenerator {
  constructor() {
    this.musicGenerator = new MusicGenerator();
    this.visualGenerator = new VisualGenerator();
    this.videoRenderer = new VideoRenderer();
    this.outputDir = path.join(__dirname, 'output');
  }

  /**
   * Generate a complete music video
   * @param {string} genre - Music genre (electronic, ambient, hiphop, pop, techno)
   * @param {string} outputName - Name for the output file (without extension)
   */
  async generate(genre = 'electronic', outputName = null) {
    console.log('='.repeat(60));
    console.log('🎵 MUSIC VIDEO GENERATOR 🎬');
    console.log('='.repeat(60));
    console.log(`Genre: ${genre}`);
    console.log('='.repeat(60));
    console.log();

    const startTime = Date.now();
    
    // Setup output directories
    const timestamp = Date.now();
    // Sanitize outputName to prevent path traversal attacks
    const sanitizedName = outputName ? path.basename(outputName) : `music_video_${genre}_${timestamp}`;
    const projectDir = path.join(this.outputDir, sanitizedName);
    const framesDir = path.join(projectDir, 'frames');
    const introDir = path.join(projectDir, 'intro');
    const outroDir = path.join(projectDir, 'outro');
    const audioPath = path.join(projectDir, 'audio.wav');
    const videoPath = path.join(this.outputDir, `${sanitizedName}.mp4`);

    // Create directories
    [projectDir, framesDir, introDir, outroDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    try {
      // Step 1: Generate music
      console.log('STEP 1: Generating Music');
      console.log('-'.repeat(60));
      const musicMetadata = await this.musicGenerator.generateMusic(genre, audioPath);
      console.log(`✓ Music generated: ${musicMetadata.duration}s at ${musicMetadata.tempo} BPM`);
      console.log();

      // Step 2: Generate intro visuals
      console.log('STEP 2: Generating Intro');
      console.log('-'.repeat(60));
      const introMetadata = await this.visualGenerator.generateIntro(genre, introDir, 3);
      console.log(`✓ Intro generated: ${introMetadata.frameCount} frames`);
      console.log();

      // Step 3: Generate main visuals
      console.log('STEP 3: Generating Main Visuals');
      console.log('-'.repeat(60));
      const visualMetadata = await this.visualGenerator.generateVisuals(musicMetadata, framesDir);
      console.log(`✓ Visuals generated: ${visualMetadata.frameCount} frames`);
      console.log();

      // Step 4: Generate outro visuals
      console.log('STEP 4: Generating Outro');
      console.log('-'.repeat(60));
      const outroMetadata = await this.visualGenerator.generateOutro(genre, outroDir, 3);
      console.log(`✓ Outro generated: ${outroMetadata.frameCount} frames`);
      console.log();

      // Step 5: Render video
      console.log('STEP 5: Rendering Final Video');
      console.log('-'.repeat(60));
      const videoMetadata = await this.videoRenderer.renderComplete(
        introMetadata,
        visualMetadata,
        outroMetadata,
        audioPath,
        videoPath
      );
      console.log();

      // Calculate statistics
      const endTime = Date.now();
      const totalTime = Math.floor((endTime - startTime) / 1000);
      const minutes = Math.floor(totalTime / 60);
      const seconds = totalTime % 60;
      const fileSize = (videoMetadata.size / (1024 * 1024)).toFixed(2);

      // Print summary
      console.log('='.repeat(60));
      console.log('✓ VIDEO GENERATION COMPLETE!');
      console.log('='.repeat(60));
      console.log(`Output: ${videoPath}`);
      console.log(`File size: ${fileSize} MB`);
      console.log(`Duration: ${musicMetadata.duration}s`);
      console.log(`Resolution: 1920x1080 @ 30fps`);
      console.log(`Total generation time: ${minutes}m ${seconds}s`);
      console.log('='.repeat(60));

      // Clean up temporary files (optional - keep for debugging)
      console.log('\nCleaning up temporary files...');
      this._cleanupTempFiles(projectDir);
      console.log('✓ Cleanup complete');

      return videoPath;

    } catch (error) {
      console.error('\n❌ Error during video generation:');
      console.error(error);
      throw error;
    }
  }

  /**
   * Clean up temporary files
   */
  _cleanupTempFiles(projectDir) {
    const dirsToClean = ['frames', 'intro', 'outro'];
    
    dirsToClean.forEach(dir => {
      const fullPath = path.join(projectDir, dir);
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath);
        files.forEach(file => {
          fs.unlinkSync(path.join(fullPath, file));
        });
        fs.rmSync(fullPath, { recursive: true, force: true });
      }
    });

    // Remove audio file
    const audioPath = path.join(projectDir, 'audio.wav');
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }

    // Remove project directory if empty
    if (fs.existsSync(projectDir)) {
      const remaining = fs.readdirSync(projectDir);
      if (remaining.length === 0) {
        fs.rmSync(projectDir, { recursive: true, force: true });
      }
    }
  }

  /**
   * List available genres
   */
  listGenres() {
    return Object.keys(this.musicGenerator.genreTemplates);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Music Video Generator
=====================

Usage:
  node generate.js [genre] [output-name]

Arguments:
  genre        Music genre (default: electronic)
               Available: electronic, ambient, hiphop, pop, techno
  output-name  Custom name for output file (optional)

Examples:
  node generate.js electronic
  node generate.js ambient my_ambient_video
  node generate.js techno high_energy_video
  node generate.js pop cool_pop_music

Options:
  --help, -h   Show this help message
  --list, -l   List available genres
`);
    process.exit(0);
  }

  if (args.includes('--list') || args.includes('-l')) {
    const generator = new MusicVideoGenerator();
    console.log('Available genres:');
    generator.listGenres().forEach(genre => {
      console.log(`  - ${genre}`);
    });
    process.exit(0);
  }

  const genre = args[0] || 'electronic';
  const outputName = args[1] || null;

  const generator = new MusicVideoGenerator();
  
  // Validate genre
  if (!generator.listGenres().includes(genre)) {
    console.error(`Error: Unknown genre "${genre}"`);
    console.error('Available genres:', generator.listGenres().join(', '));
    process.exit(1);
  }

  generator.generate(genre, outputName)
    .then(videoPath => {
      console.log(`\n🎉 Success! Video saved to: ${videoPath}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Generation failed:', error.message);
      process.exit(1);
    });
}

module.exports = MusicVideoGenerator;
