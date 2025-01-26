import { NextResponse } from 'next/server';
import { SpeechClient } from '@google-cloud/speech';
import fs from 'fs';
import path from 'path';

const PROJECT_ID = process.env.GCLOUD_PROJECT;
const UPLOADS_DIR = path.join(process.cwd(), 'src', 'backend', 'uploads');

export async function POST(request) {
    console.log(UPLOADS_DIR);
  const { fileName } = await request.json(); 

  const filePath = path.join(UPLOADS_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  try {
    const client = new SpeechClient({ projectId: PROJECT_ID });

    const audioContent = fs.readFileSync(filePath).toString('base64');

    const requestPayload = {
      audio: {
        content: audioContent,
      },
      config: {
        encoding: 'LINEAR16', 
        languageCode: 'en-US', 
      },
    };

    const [response] = await client.recognize(requestPayload);

    const transcription =
      response.results
        ?.map((result) => result.alternatives[0].transcript)
        ?.join(' ') || 'No transcription available';

    return NextResponse.json({ transcription });
  } catch (error) {
    console.error('Error processing speech-to-text:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
