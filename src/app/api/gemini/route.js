import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { VertexAI } from '@google-cloud/vertexai';
import fs from 'fs';
import path from 'path';

const PROJECT_ID = process.env.GCLOUD_PROJECT;
const LOCATION = 'us-central1';
const MODEL = 'gemini-1.5-flash-001';
const storage = new Storage({ projectId: PROJECT_ID });
const BUCKET_NAME = 'cloud-ai-platform-2b06c355-6e38-478e-bd90-39ab5257387a';

export async function POST(request) {
  const { imageBase64, question } = await request.json();

  const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
  const generativeModel = vertexAI.getGenerativeModel({ model: MODEL });

  const fileName = `screenshot-${Date.now()}.png`;
  const tmpDir = path.join(process.cwd(), 'src/backend/uploads');
  const localPath = path.join(tmpDir, fileName);
  const bucketFilePath = `uploads/${fileName}`;
  
  try {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir);
    }

    const imageBuffer = Buffer.from(imageBase64, 'base64');
    fs.writeFileSync(localPath, imageBuffer);

    console.log(`Image saved locally at: ${localPath}`);

    await storage.bucket(BUCKET_NAME).upload(localPath, {
      destination: bucketFilePath,
      metadata: { contentType: 'image/png' },
    });

    const fileUri = `gs://${BUCKET_NAME}/${bucketFilePath}`;
    console.log(`File uploaded to: ${fileUri}`);

    const requestPayload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              file_data: {
                file_uri: fileUri,
                mime_type: 'image/png',
              },
            },
            {
              text: question,
            },
          ],
        },
      ],
    };

    const response = await generativeModel.generateContent(requestPayload);

    const answer = response.response.candidates[0].content.parts[0].text;

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
  }
}
