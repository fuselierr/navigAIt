
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

function startStream() {
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
    const filePath = path.join(process.cwd(), 'uploads', 'screenshot.png');
    console.log('Reading image from:', filePath);
    try {
        const imageBuffer = await fs.readFile(filePath);

        return imageBuffer.toString('base64');
    } catch (error) {
        console.error('Error converting image to Base64:', error);
        throw error;
    }
}

import { exec } from 'child_process';

const speechCallback = async (stream) => {
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
      });
  
      console.log('Gemini Response:', geminiResponse.data);
  
      const geminiAnswer = geminiResponse.data.answer; // Extract the response text from Gemini
  
      // Step 2: Send Gemini's response to the Text-to-Speech API
      const ttsResponse = await axios.post('http://localhost:3000/api/texttospeech', {
        text: geminiAnswer, // Pass the assistant's response
      });
  
      console.log('Text-to-Speech Response:', ttsResponse.data);
  
      const audioFilePath = ttsResponse.data.filePath; // Extract the path to the audio file
  
      // Step 3: Play the audio
  
      // Use a system tool like `ffplay` or `aplay` to play the audio
      exec(`ffplay -nodisp -autoexit ${audioFilePath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error playing audio: ${error.message}`);
          return;
        }
        console.log('Audio played successfully');
      });
    } catch (error) {
      console.error('Error processing audio:', error.message);
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
        silence: 2000,
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
    console.log('Audio recording stopped');
}

startRecording();

export { startRecording, stopRecording };
