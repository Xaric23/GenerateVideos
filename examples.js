#!/usr/bin/env node

/**
 * Example script demonstrating different ways to use the Music Video Generator
 */

const MusicVideoGenerator = require('./generate');

async function runExamples() {
  const generator = new MusicVideoGenerator();

  console.log('Music Video Generator - Examples\n');
  console.log('Available genres:', generator.listGenres().join(', '));
  console.log('\n' + '='.repeat(60));
  
  // Example 1: Generate with default genre
  console.log('\nExample 1: Default Generation');
  console.log('Command: node generate.js');
  console.log('This will generate an electronic music video\n');

  // Example 2: Generate specific genre
  console.log('\nExample 2: Specific Genre');
  console.log('Command: node generate.js ambient');
  console.log('This will generate an ambient music video\n');

  // Example 3: Generate with custom name
  console.log('\nExample 3: Custom Output Name');
  console.log('Command: node generate.js pop my_pop_video');
  console.log('This will generate a pop music video named "my_pop_video.mp4"\n');

  // Example 4: Using as a module
  console.log('\nExample 4: Using as a Node.js Module');
  console.log(`
const MusicVideoGenerator = require('./generate');

async function generate() {
  const generator = new MusicVideoGenerator();
  const videoPath = await generator.generate('hiphop', 'custom_name');
  console.log('Video saved to:', videoPath);
}

generate();
  `);

  console.log('\n' + '='.repeat(60));
  console.log('\nTo actually generate a video, run:');
  console.log('  node generate.js [genre] [optional-name]');
  console.log('\nFor help, run:');
  console.log('  node generate.js --help');
}

runExamples().catch(console.error);
