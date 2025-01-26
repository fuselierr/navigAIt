import { NextResponse } from 'next/server';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'src', 'backend', 'uploads'); 

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export async function POST(request) {
  const { text } = await request.json(); 

  if (!text) {
    return NextResponse.json({ error: 'No text provided' }, { status: 400 });
  }

  try {
    const client = new TextToSpeechClient();

    const requestPayload = {
      input: { text },
      voice: { languageCode: 'en-US', name: 'en-US-Standard-E', ssmlGender: 'FEMALE' },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.5,
      },
    };

    const [response] = await client.synthesizeSpeech(requestPayload);

    const audioBase64 = response.audioContent.toString('base64');

    return NextResponse.json({
      message: 'Text converted to speech successfully',
      audioBase64,
    });
  } catch (error) {
    console.error('Error converting text to speech:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}