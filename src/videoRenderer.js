const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

/**
 * Video Renderer Module
 * Combines audio and visual frames into a final video
 */

class VideoRenderer {
  constructor() {
    this.codec = 'libx264';
    this.audioCodec = 'aac';
    this.outputFormat = 'mp4';
  }

  /**
   * Render intro section
   */
  async renderIntro(introMetadata, audioPath, outputPath) {
    return new Promise((resolve, reject) => {
      console.log('Rendering intro section...');
      
      const { framesDir, fps } = introMetadata;
      const inputPattern = path.join(framesDir, 'intro_%06d.png');
      
      // Create silent audio for intro
      const introDuration = introMetadata.frameCount / fps;
      
      ffmpeg()
        .input(inputPattern)
        .inputFPS(fps)
        .input('anullsrc=channel_layout=stereo:sample_rate=44100')
        .inputFormat('lavfi')
        .outputOptions([
          '-c:v libx264',
          '-preset medium',
          '-crf 23',
          '-pix_fmt yuv420p',
          '-c:a aac',
          '-b:a 192k',
          `-t ${introDuration}`
        ])
        .output(outputPath)
        .on('start', (cmd) => {
          console.log('  FFmpeg command:', cmd);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`  Progress: ${progress.percent.toFixed(1)}%`);
          }
        })
        .on('end', () => {
          console.log('Intro rendering complete!');
          resolve();
        })
        .on('error', (err) => {
          console.error('Error rendering intro:', err);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Render main content section
   */
  async renderMain(visualMetadata, audioPath, outputPath) {
    return new Promise((resolve, reject) => {
      console.log('Rendering main content...');
      
      const { framesDir, fps } = visualMetadata;
      const inputPattern = path.join(framesDir, 'frame_%06d.png');
      
      ffmpeg()
        .input(inputPattern)
        .inputFPS(fps)
        .input(audioPath)
        .outputOptions([
          '-c:v libx264',
          '-preset medium',
          '-crf 23',
          '-pix_fmt yuv420p',
          '-c:a aac',
          '-b:a 192k',
          '-shortest'
        ])
        .output(outputPath)
        .on('start', (cmd) => {
          console.log('  FFmpeg command:', cmd);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`  Progress: ${progress.percent.toFixed(1)}%`);
          }
        })
        .on('end', () => {
          console.log('Main content rendering complete!');
          resolve();
        })
        .on('error', (err) => {
          console.error('Error rendering main content:', err);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Render outro section
   */
  async renderOutro(outroMetadata, outputPath) {
    return new Promise((resolve, reject) => {
      console.log('Rendering outro section...');
      
      const { framesDir, fps } = outroMetadata;
      const inputPattern = path.join(framesDir, 'outro_%06d.png');
      
      // Create silent audio for outro
      const outroDuration = outroMetadata.frameCount / fps;
      
      ffmpeg()
        .input(inputPattern)
        .inputFPS(fps)
        .input('anullsrc=channel_layout=stereo:sample_rate=44100')
        .inputFormat('lavfi')
        .outputOptions([
          '-c:v libx264',
          '-preset medium',
          '-crf 23',
          '-pix_fmt yuv420p',
          '-c:a aac',
          '-b:a 192k',
          `-t ${outroDuration}`
        ])
        .output(outputPath)
        .on('start', (cmd) => {
          console.log('  FFmpeg command:', cmd);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`  Progress: ${progress.percent.toFixed(1)}%`);
          }
        })
        .on('end', () => {
          console.log('Outro rendering complete!');
          resolve();
        })
        .on('error', (err) => {
          console.error('Error rendering outro:', err);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Concatenate video segments
   */
  async concatenateVideos(videoPaths, outputPath) {
    return new Promise((resolve, reject) => {
      console.log('Concatenating video segments...');
      
      // Create concat file list
      const concatListPath = path.join(path.dirname(outputPath), 'concat_list.txt');
      const fileList = videoPaths.map(p => `file '${path.resolve(p)}'`).join('\n');
      fs.writeFileSync(concatListPath, fileList);
      
      ffmpeg()
        .input(concatListPath)
        .inputOptions(['-f', 'concat', '-safe', '0'])
        .outputOptions([
          '-c', 'copy'
        ])
        .output(outputPath)
        .on('start', (cmd) => {
          console.log('  FFmpeg command:', cmd);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`  Progress: ${progress.percent.toFixed(1)}%`);
          }
        })
        .on('end', () => {
          console.log('Concatenation complete!');
          // Clean up concat list
          if (fs.existsSync(concatListPath)) {
            fs.unlinkSync(concatListPath);
          }
          resolve();
        })
        .on('error', (err) => {
          console.error('Error concatenating videos:', err);
          // Clean up concat list
          if (fs.existsSync(concatListPath)) {
            fs.unlinkSync(concatListPath);
          }
          reject(err);
        })
        .run();
    });
  }

  /**
   * Render complete video with intro, main content, and outro
   */
  async renderComplete(introMetadata, visualMetadata, outroMetadata, audioPath, outputPath) {
    const tempDir = path.join(path.dirname(outputPath), 'temp_segments');
    
    // Create temp directory for segments
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const introPath = path.join(tempDir, 'intro.mp4');
    const mainPath = path.join(tempDir, 'main.mp4');
    const outroPath = path.join(tempDir, 'outro.mp4');
    
    try {
      // Render each segment
      await this.renderIntro(introMetadata, audioPath, introPath);
      await this.renderMain(visualMetadata, audioPath, mainPath);
      await this.renderOutro(outroMetadata, outroPath);
      
      // Concatenate all segments
      await this.concatenateVideos([introPath, mainPath, outroPath], outputPath);
      
      // Clean up temp files
      console.log('Cleaning up temporary files...');
      if (fs.existsSync(introPath)) fs.unlinkSync(introPath);
      if (fs.existsSync(mainPath)) fs.unlinkSync(mainPath);
      if (fs.existsSync(outroPath)) fs.unlinkSync(outroPath);
      if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
      
      console.log(`\n✓ Video generated successfully: ${outputPath}`);
      
      return {
        path: outputPath,
        size: fs.statSync(outputPath).size
      };
    } catch (error) {
      // Clean up on error
      if (fs.existsSync(introPath)) fs.unlinkSync(introPath);
      if (fs.existsSync(mainPath)) fs.unlinkSync(mainPath);
      if (fs.existsSync(outroPath)) fs.unlinkSync(outroPath);
      if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
      
      throw error;
    }
  }
}

module.exports = VideoRenderer;
