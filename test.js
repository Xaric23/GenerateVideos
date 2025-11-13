#!/usr/bin/env node

/**
 * Quick test script to verify the music video generation works
 * Generates a very short test video (10 seconds) to verify functionality
 */

const MusicVideoGenerator = require('./generate');
const path = require('path');

// Temporarily override duration for testing
const originalGenerator = require('./src/musicGenerator');
const testGenerator = new originalGenerator.constructor();

// Monkey patch for testing - create very short music
const MusicGenerator = require('./src/musicGenerator');
const originalGenerate = MusicGenerator.prototype.generateMusic;

MusicGenerator.prototype.generateMusic = async function(genre, outputPath) {
  const template = this.genreTemplates[genre] || this.genreTemplates.electronic;
  const duration = 10; // Force 10 second duration for testing
  
  console.log(`Generating ${genre} music (TEST MODE: ${duration}s at ${template.tempo} BPM)...`);
  
  const scriptContent = this._generateToneScript(template, duration, outputPath);
  const scriptPath = path.join(path.dirname(outputPath), 'temp_music_script.js');
  
  const fs = require('fs');
  fs.writeFileSync(scriptPath, scriptContent);
  
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);
  
  try {
    await execAsync(`node "${scriptPath}"`);
    fs.unlinkSync(scriptPath);
    
    return {
      tempo: template.tempo,
      duration: duration,
      genre: genre,
      path: outputPath
    };
  } catch (error) {
    if (fs.existsSync(scriptPath)) {
      fs.unlinkSync(scriptPath);
    }
    throw error;
  }
};

console.log('Starting quick test video generation (10 seconds)...\n');

const generator = new MusicVideoGenerator();
generator.generate('electronic', 'test_video')
  .then(videoPath => {
    console.log('\n✓ TEST PASSED! Video generation works correctly.');
    console.log(`Test video: ${videoPath}`);
    process.exit(0);
  })
  .catch(error => {
    console.error('\n✗ TEST FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
