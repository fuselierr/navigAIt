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

  console.log(question);

  if (!imageBase64 || !question) {
    throw new Error('Missing imageBase64 or question in the request.');
  }
  
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
              text: "You are helping someone onboard onto their company website, which you can find in the document that will be given to you. Inside of the document are the precise instructions for the person you are helping to install different technologies for them. Everytime you are given a screenshot, you will interpret exactly what the user is doing, and then compare it to the step on the documentation that they are on. If they are doing something wrong, ex. Downloading the wrong version of a language, You are helping someone onboard onto their company laptop. They are a software engineer, and you will help them by analyzing the documentation for onboarding as well as analyzing screenshots of their screen every 3 seconds. Inside of the document there are precise instructions for the person you are helping to install stuff with. Everytime you are given a screenshot, you will take four steps: Interpret what the user is doing in the screenshot very precisely Compare what the user is doing and see what step they are most likely on Confirm if they are doing the step properly, such as making sure they are not downloading the wrong version of the technology, or on the correct website If the user is on the right track, you output “NOTHING”. If you deem that they need URGENT help such as they are downloading the wrong version, you will output exactly what will be needed to help them in one concise instruction." + question,
            }
          ],
        },
      ],
    };

    const response = await generativeModel.generateContent(requestPayload);

    console.log(response.response.candidates[0]);

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
