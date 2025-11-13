const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Music Generator Module
 * Generates procedural music based on genre using Tone.js offline rendering
 */

class MusicGenerator {
  constructor() {
    this.genreTemplates = {
      electronic: {
        tempo: 128,
        scale: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'],
        bassNotes: ['C2', 'G2', 'A2', 'F2'],
        chords: [
          ['C4', 'E4', 'G4'],
          ['G3', 'B3', 'D4'],
          ['A3', 'C4', 'E4'],
          ['F3', 'A3', 'C4']
        ],
        duration: { min: 180, max: 300 } // 3-5 minutes in seconds
      },
      ambient: {
        tempo: 80,
        scale: ['C4', 'D4', 'F4', 'G4', 'A4', 'C5', 'D5'],
        bassNotes: ['C2', 'F2', 'G2'],
        chords: [
          ['C4', 'E4', 'G4', 'B4'],
          ['F3', 'A3', 'C4', 'E4'],
          ['G3', 'B3', 'D4', 'F4']
        ],
        duration: { min: 180, max: 300 }
      },
      hiphop: {
        tempo: 90,
        scale: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5'],
        bassNotes: ['C2', 'Eb2', 'F2', 'G2'],
        chords: [
          ['C4', 'Eb4', 'G4'],
          ['F3', 'Ab3', 'C4'],
          ['G3', 'Bb3', 'D4']
        ],
        duration: { min: 180, max: 300 }
      },
      pop: {
        tempo: 120,
        scale: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
        bassNotes: ['C2', 'F2', 'G2', 'A2'],
        chords: [
          ['C4', 'E4', 'G4'],
          ['F3', 'A3', 'C4'],
          ['G3', 'B3', 'D4'],
          ['A3', 'C4', 'E4']
        ],
        duration: { min: 180, max: 300 }
      },
      techno: {
        tempo: 140,
        scale: ['C4', 'D4', 'F4', 'G4', 'A4', 'C5'],
        bassNotes: ['C2', 'C2', 'D2', 'F2'],
        chords: [
          ['C4', 'F4', 'G4'],
          ['D4', 'F4', 'A4'],
          ['C4', 'E4', 'G4'],
          ['F3', 'A3', 'C4']
        ],
        duration: { min: 180, max: 300 }
      }
    };
  }

  /**
   * Generate music for a given genre
   * @param {string} genre - The music genre
   * @param {string} outputPath - Path to save the audio file
   * @returns {Promise<Object>} Music metadata including tempo and duration
   */
  async generateMusic(genre, outputPath) {
    const template = this.genreTemplates[genre] || this.genreTemplates.electronic;
    const duration = Math.floor(Math.random() * (template.duration.max - template.duration.min) + template.duration.min);
    
    console.log(`Generating ${genre} music (${duration}s at ${template.tempo} BPM)...`);
    
    // Create a JavaScript file that will use Tone.js to generate the music
    const scriptContent = this._generateToneScript(template, duration, outputPath);
    const scriptPath = path.join(path.dirname(outputPath), 'temp_music_script.js');
    
    fs.writeFileSync(scriptPath, scriptContent);
    
    // Execute the script with Node.js
    try {
      await execAsync(`node "${scriptPath}"`);
      fs.unlinkSync(scriptPath); // Clean up temp script
      
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
  }

  /**
   * Generate a Tone.js script for offline rendering
   */
  _generateToneScript(template, duration, outputPath) {
    return `
const Tone = require('tone');
const fs = require('fs');

async function generateMusic() {
  // Set up offline context
  const context = new Tone.OfflineContext(2, ${duration}, 44100);
  Tone.setContext(context);
  
  const tempo = ${template.tempo};
  Tone.Transport.bpm.value = tempo;
  
  // Create instruments
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.5, release: 1 }
  }).toDestination();
  
  const bass = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.8 }
  }).toDestination();
  
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 5,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
  }).toDestination();
  
  const hihat = new Tone.MetalSynth({
    frequency: 200,
    envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5
  }).toDestination();
  
  // Music data
  const scale = ${JSON.stringify(template.scale)};
  const bassNotes = ${JSON.stringify(template.bassNotes)};
  const chords = ${JSON.stringify(template.chords)};
  
  // Schedule music patterns
  const beatDuration = 60 / tempo;
  const totalBeats = Math.floor(${duration} / beatDuration);
  
  // Kick drum pattern (every beat)
  for (let i = 0; i < totalBeats; i++) {
    const time = i * beatDuration;
    if (i % 2 === 0) {
      kick.triggerAttackRelease('C1', '8n', time);
    }
  }
  
  // Hi-hat pattern (eighth notes)
  for (let i = 0; i < totalBeats * 2; i++) {
    const time = i * beatDuration / 2;
    hihat.triggerAttackRelease('16n', time, Math.random() * 0.3 + 0.1);
  }
  
  // Bass line (changes every 2 bars)
  for (let i = 0; i < totalBeats / 4; i++) {
    const time = i * beatDuration * 4;
    const note = bassNotes[i % bassNotes.length];
    bass.triggerAttackRelease(note, '2n', time);
  }
  
  // Melodic pattern (varies by section)
  for (let i = 0; i < totalBeats / 8; i++) {
    const time = i * beatDuration * 8;
    const chord = chords[i % chords.length];
    synth.triggerAttackRelease(chord, '4n', time);
    
    // Add some melody notes
    for (let j = 0; j < 4; j++) {
      const noteTime = time + j * beatDuration * 2;
      const note = scale[Math.floor(Math.random() * scale.length)];
      synth.triggerAttackRelease(note, '8n', noteTime, Math.random() * 0.3 + 0.3);
    }
  }
  
  // Start transport
  Tone.Transport.start(0);
  
  // Render offline
  const buffer = await context.render();
  
  // Convert to WAV format
  const audioData = buffer.toArray();
  const wavBuffer = createWavBuffer(audioData, 44100);
  
  fs.writeFileSync('${outputPath}', wavBuffer);
  console.log('Music generation complete!');
}

function createWavBuffer(audioData, sampleRate) {
  const numChannels = audioData.length;
  const length = audioData[0].length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  const bufferSize = 44 + dataSize;
  
  const buffer = Buffer.alloc(bufferSize);
  let offset = 0;
  
  // RIFF header
  buffer.write('RIFF', offset); offset += 4;
  buffer.writeUInt32LE(bufferSize - 8, offset); offset += 4;
  buffer.write('WAVE', offset); offset += 4;
  
  // fmt chunk
  buffer.write('fmt ', offset); offset += 4;
  buffer.writeUInt32LE(16, offset); offset += 4; // chunk size
  buffer.writeUInt16LE(1, offset); offset += 2; // audio format (PCM)
  buffer.writeUInt16LE(numChannels, offset); offset += 2;
  buffer.writeUInt32LE(sampleRate, offset); offset += 4;
  buffer.writeUInt32LE(byteRate, offset); offset += 4;
  buffer.writeUInt16LE(blockAlign, offset); offset += 2;
  buffer.writeUInt16LE(16, offset); offset += 2; // bits per sample
  
  // data chunk
  buffer.write('data', offset); offset += 4;
  buffer.writeUInt32LE(dataSize, offset); offset += 4;
  
  // audio data
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, audioData[channel][i]));
      const intSample = Math.floor(sample * 32767);
      buffer.writeInt16LE(intSample, offset);
      offset += 2;
    }
  }
  
  return buffer;
}

generateMusic().catch(console.error);
`;
  }

  /**
   * Analyze tempo from generated music file
   */
  async analyzeTempo(audioPath) {
    // For generated music, we already know the tempo from the template
    // This is a placeholder for potential future tempo detection
    return this.currentTempo;
  }
}

module.exports = MusicGenerator;
