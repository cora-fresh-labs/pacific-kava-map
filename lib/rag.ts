import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

// Initialize OpenAI client
// Note: Requires OPENAI_API_KEY in .env.local
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CORPUS_DIR = path.join(process.cwd(), 'data', 'corpus');

/**
 * Reads all files from the local corpus directory.
 * This is a simple document loader. For a production RAG system,
 * you would want to chunk these documents and store them in a vector DB.
 */
export function getLocalCorpus(): string {
  try {
    if (!fs.existsSync(CORPUS_DIR)) {
      console.warn(`Corpus directory not found: ${CORPUS_DIR}`);
      return "No proprietary data available.";
    }

    const files = fs.readdirSync(CORPUS_DIR);
    let allContent = "";

    for (const file of files) {
      // Skip the README or any non-text/markdown files for simplicity in this demo
      if (file === 'README.md' || file.startsWith('.')) continue;
      
      const filePath = path.join(CORPUS_DIR, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isFile() && (file.endsWith('.txt') || file.endsWith('.md'))) {
         const content = fs.readFileSync(filePath, 'utf-8');
         allContent += `\\n--- Document: ${file} ---\\n${content}\\n`;
      }
    }

    return allContent || "Corpus is empty. Add .txt or .md files to data/corpus.";
  } catch (error) {
    console.error("Error reading local corpus:", error);
    return "Error reading proprietary data.";
  }
}

/**
 * Queries OpenAI using the local corpus as context.
 */
export async function queryRAG(query: string, contextPrefix: string = "Answer the following based strictly on the provided context.") {
  const corpus = getLocalCorpus();
  
  const systemPrompt = `
You are a classified intelligence AI for the 'Kava Knowledge' network.
Your tone should be dry, analytical, and tactical.
${contextPrefix}

<PROPRIETARY_DATA>
${corpus}
</PROPRIETARY_DATA>

If the answer cannot be found in the data, state: "[DATA NOT FOUND IN LOCAL REPOSITORY]". Do not guess or use outside knowledge.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using a fast, cost-effective model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      temperature: 0.1, // Keep it deterministic
      max_tokens: 250,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("RAG Query Error:", error);
    return "[COMMUNICATION ERROR: UNABLE TO REACH UPLINK]";
  }
}
