
import axios from 'axios';

const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'en-US';

import chalk from 'chalk';
import { Writable } from 'stream';
import recorder from 'node-record-lpcm16';
import speech from '@google-cloud/speech';
const PROJECT_ID = process.env.GCLOUD_PROJECT;

// Imports the Google Cloud client library
// Currently, only v1p1beta1 contains result-end-time

const client = new speech.SpeechClient({
  projectId: PROJECT_ID,
  keyFilename: '../../gcpauth.json',
});
const config = {
  encoding: encoding,
  sampleRateHertz: sampleRateHertz,
  languageCode: languageCode,
};

const request = {
  config,
  interimResults: true,
};

let recognizeStream = null;
let restartCounter = 0;
let audioInput = [];
let lastAudioInput = [];
let resultEndTime = 0;
let isFinalEndTime = 0;
let finalRequestEndTime = 0;
let newStream = true;
let bridgingOffset = 0;
let lastTranscriptWasFinal = false;
let initialPrompt = true;
let isPlayingAudio = false;

function startStream() {
  if (isPlayingAudio) { return; }
  // Clear current audioInput
  audioInput = [];
  // Initiate (Reinitiate) a recognize stream
  recognizeStream = client
    .streamingRecognize(request)
    .on('error', err => {
      if (err.code === 11) {
        // restartStream();
      } else {
        console.error('API request error ' + err);
      }
    })
    .on('data', speechCallback);
}

import fs from 'fs/promises';
import path from 'path';

async function convertImageToBase64() {
    const filePath = path.join(process.cwd(), 'uploads', 'screenshot.png'); // output of the user's feed
    console.log('Reading image from:', filePath);
    try {
        const imageBuffer = await fs.readFile(filePath);

        return imageBuffer.toString('base64');
    } catch (error) {
        console.error('Error converting image to Base64:', error);
        throw error;
    }
}

const filePath = path.join(process.cwd(), 'uploads', 'combined.txt');

fs.readFile(filePath, 'utf-8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
  } else {
    const pdfText = data; 
  }
});

async function readFileContent() {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const pdfText = data;
    return pdfText;
  } catch (error) {
    console.error('Error reading file content:', error);
    throw error;
  }
}

import { spawn } from 'child_process';

const speechCallback = async (stream) => {
  if (isPlayingAudio) { return; }
  // Convert API result end time from seconds + nanoseconds to milliseconds
  resultEndTime =
    stream.results[0].resultEndTime.seconds * 1000 +
    Math.round(stream.results[0].resultEndTime.nanos / 1000000);

  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  let stdoutText = '';
  if (stream.results && stream.results[0] && stream.results[0].alternatives && stream.results[0].alternatives[0]) {
    stdoutText = stream.results[0].alternatives[0].transcript;
  }
  if (stream.results[0].isFinal) {
    // means that the silence reached its threshold and you can feed it into the model
    process.stdout.write(chalk.green(`${stdoutText}\n`));
    
    try {
      // Step 1: Send transcript and image to Gemini
      const geminiResponse = await axios.post('http://localhost:3000/api/gemini', {
        imageBase64: await convertImageToBase64(), // Convert image to Base64
        question: stream.results[0].alternatives[0].transcript,
        startNew: initialPrompt,
        pdfText: await readFileContent(),
      });

      if (initialPrompt) {
        initialPrompt = false;
      }
  
      console.log('Gemini Response:', geminiResponse.data.answer);

      const geminiAnswer = geminiResponse.data.answer; 
  
      // Step 2: Send Gemini's response to the Text-to-Speech API
      const ttsResponse = await axios.post('http://localhost:3000/api/texttospeech', {
        text: geminiAnswer, 
      });
  
      console.log('Text-to-Speech Response:', ttsResponse.data.message);
  
      const audioBase64 = ttsResponse.data.audioBase64;

      // Decode the base64 into raw PCM buffer
      const audioBuffer = Buffer.from(audioBase64, 'base64');

      // Spawn the ffplay process and specify input via pipe
      const ffplay = spawn('ffplay', ['-i', 'pipe:0', '-autoexit', '-nodisp']);

      // Pipe the audio buffer into ffplay's standard input
      isPlayingAudio = true;
      ffplay.stdin.write(audioBuffer);
      ffplay.stdin.end();

      ffplay.on('close', (code) => {
        isPlayingAudio = false;
        if (code === 0) {
          console.log('Audio played successfully.');
        } else {
          console.error(`ffplay exited with code ${code}`);
        }
      });
    } catch (error) {
      console.error('Error processing prompt:', error.message);
    }

    isFinalEndTime = resultEndTime;
    lastTranscriptWasFinal = true;
  } else {
    // Make sure transcript does not exceed console character length
    if (stdoutText.length > process.stdout.columns) {
      stdoutText =
        stdoutText.substring(0, process.stdout.columns - 4) + '...';
    }
    process.stdout.write(chalk.red(`${stdoutText}`));

    lastTranscriptWasFinal = false;
  }
};

const audioInputStreamTransform = new Writable({
  write(chunk, encoding, next) {
    if (newStream && lastAudioInput.length !== 0) {
      // Approximate math to calculate time of chunks
      const chunkTime = streamingLimit / lastAudioInput.length;
      if (chunkTime !== 0) {
        if (bridgingOffset < 0) {
          bridgingOffset = 0;
        }
        if (bridgingOffset > finalRequestEndTime) {
          bridgingOffset = finalRequestEndTime;
        }
        const chunksFromMS = Math.floor(
          (finalRequestEndTime - bridgingOffset) / chunkTime
        );
        bridgingOffset = Math.floor(
          (lastAudioInput.length - chunksFromMS) * chunkTime
        );

        for (let i = chunksFromMS; i < lastAudioInput.length; i++) {
          recognizeStream.write(lastAudioInput[i]);
        }
      }
      newStream = false;
    }

    audioInput.push(chunk);

    if (recognizeStream) {
      recognizeStream.write(chunk);
    }

    next();
  },

  final() {
    if (recognizeStream) {
      recognizeStream.end();
    }
  },
});

function restartStream() {
  if (recognizeStream) {
    recognizeStream.end();
    recognizeStream.removeListener('data', speechCallback);
    recognizeStream = null;
  }
  if (resultEndTime > 0) {
    finalRequestEndTime = isFinalEndTime;
  }
  resultEndTime = 0;

  lastAudioInput = [];
  lastAudioInput = audioInput;

  restartCounter++;

  if (!lastTranscriptWasFinal) {
    process.stdout.write('\n');
  }
  process.stdout.write(
    chalk.yellow(`${streamingLimit * restartCounter}: RESTARTING REQUEST\n`)
  );

  newStream = true;

  startStream();
}
// Start recording and send the microphone input to the Speech API

function startRecording() {
    recorder
    .record({
        sampleRateHertz: sampleRateHertz,
        threshold: 0.8, // Start recording only when sound intensity 
        thresholdStart: 0.8, // Start recording when sound intensity 
        thresholdEnd: 0.7,
        silence: 2500,
        keepSilence: true,
        recordProgram: 'rec', // Try also "arecord" or "sox"
    })
    .stream()
    .on('error', err => {
        console.error('Audio recording error ' + err);
    })
    .pipe(audioInputStreamTransform);

    console.log('');
    console.log('Listening, press Ctrl+C to stop.');
    console.log('');
    console.log('End (ms)       Transcript Results/Status');
    console.log('=========================================================');

    startStream();
}

function stopRecording() {
  if (recognizeStream) {
    recognizeStream.end();
    recognizeStream.removeListener('data', speechCallback);
    recognizeStream = null;
  }
  if (resultEndTime > 0) {
    finalRequestEndTime = isFinalEndTime;
  }
  resultEndTime = 0;

  lastAudioInput = [];
  lastAudioInput = audioInput;
    console.log('Audio recording stopped');
}

export { startRecording, stopRecording };
