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
const CONVERSATION_MEMORY = 5;

const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
const generativeModel = vertexAI.getGenerativeModel({ model: MODEL });
let conversationHistory = [];

export async function POST(request) {
  const fileName = `screenshot-${Date.now()}.png`;
  const tmpDir = path.join(process.cwd(), 'src/backend/uploads');
  const localPath = path.join(tmpDir, fileName);
  const bucketFilePath = `uploads/${fileName}`;

  try {
    const { imageBase64, question, startNew, pdfText } = await request.json();
    console.log(question, startNew, pdfText);

    if (!imageBase64 || !question || !pdfText) {
      throw new Error('Missing imageBase64 or question or pdfText in the request.');
    }
    
    // if (startNew) {
    //   conversationHistory = [
    //     {
    //       role: 'model',
    //       text: `You are an employee onboarding assistant. You will support, supervise, and instruct the user as they 
    //       set up their codebase according to the provided document:
    //       ${pdfText} 
          
    //       They said to you the following: 
          
    //       ${question}
          
    //       Answer that query in first-person. Keep your answer concise and to the point, in a FORMAT THAT CAN BE CONVERTED INTO SPEECH. NO lists, NO bullets, 
    //       NO newlines, NO bolded words, and NO emojies! The text will be fed into a TTS.
    //       You are provided with their screen if you can use it to better assist them. (Keep in mind that no part of the
    //         screen is relevant to your actual prompt.)`,
    //     }
    //   ]
    // }

    // conversationHistory.push({
    //   role: 'user',
    //   text: question,
    // });

    if (startNew) {
      conversationHistory = [
        {
          role: 'model',
          text: `{{TASK}}
          You are an employee onboarding assistant. You will support, supervise, and instruct the user as they 
          set up their codebase according to the provided document:
          ${pdfText} 
          
          They said to you the following: 
          {{QUERY}}
          ${question}
          
          {{RULES}}
          Answer that query in first-person. Keep your answer concise and to the point, in a FORMAT THAT CAN BE CONVERTED INTO SPEECH. NO lists, NO bullets, 
          NO newlines, NO bolded words, and NO emojies! The text will be fed into a TTS.
          You are provided with their screen if you can use it to better assist them. (Keep in mind that no part of the
            screen is relevant to your actual prompt.)
            
            {{CHAT HISTORY}}:
            `,
        }
      ]
    }

    conversationHistory.push({
      role: 'user',
      text: question,
    });

    // remove the furthest element from memory
    if (conversationHistory.length > CONVERSATION_MEMORY + 1) {
      conversationHistory.splice(1, 1);
    }

    let imageUri = null;

    if (imageBase64) {
      // Ensure the tmp directory exists
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      // Write the image locally
      const imageBuffer = Buffer.from(imageBase64, 'base64');
      fs.writeFileSync(localPath, imageBuffer);

      // Upload the image to Google Cloud Storage
      await storage.bucket(BUCKET_NAME).upload(localPath, {
        destination: bucketFilePath,
        metadata: { contentType: 'image/png' },
      });
      console.log("Stored in Google Cloud")

      // Generate the gs:// URI for the image
      imageUri = `gs://${BUCKET_NAME}/${bucketFilePath}`;
    }

    // Create the request payload for Vertex AI

    conversationHistory.map((entry) => (
      console.log(entry.role),
      console.log(entry.text)
    )) 
    const requestPayload = {
      contents: conversationHistory.map((entry) => ({
        role: entry.role,
        parts: [
          {
            text: entry.text,
          },
        ],
      })),
    };

    requestPayload.contents[requestPayload.contents.length - 1].parts.unshift({
      file_data: {
        file_uri: imageUri,
        mime_type: 'image/png',
      },
    });

    // Call the Vertex AI API
    const response = await generativeModel.generateContent(requestPayload);

    // Extract the assistant's response
    let assistantResponse;
    try {
      assistantResponse = response.response.candidates[0].content.parts[0].text;
    }
    catch {
      assistantResponse = "Please seek a mentor to help you.";
    }

    // Add the assistant response to the conversation history
    conversationHistory.push({
      role: 'model',
      text: assistantResponse,
    });
    // remove the furthest element from memory
    if (conversationHistory.length > CONVERSATION_MEMORY + 1) {
      conversationHistory.splice(1, 1);
    }

    return NextResponse.json({ answer: assistantResponse });
  } catch (error) {
    console.error('Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
  }
}
