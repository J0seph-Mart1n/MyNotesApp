import { fetchNotes } from '@/constants/database';
import { fetchAllDiaryEntries } from '@/constants/database';

export const buildContextPrompt = async () => {
    try {
        // Fetch public notes, secret notes, and all diary entries
        const publicNotes = await fetchNotes(0);
        const secretNotes = await fetchNotes(1);
        const diaryEntries = await fetchAllDiaryEntries();

        let promptContext = "You are a highly intelligent and private AI assistant integrated into the SecretNotes app. ";
        promptContext += "You have read access to the user's personal notes, secrets, and diary entries. ";
        promptContext += "Use the following context to answer the user's questions accurately and concisely. Do not disclose secrets unless specifically asked.\n\n";

        // console.log('context',publicNotes, secretNotes, diaryEntries);

        promptContext += "--- PUBLIC NOTES ---\n";
        publicNotes.forEach(note => {
            promptContext += `Title: ${note.title}\nContent: ${JSON.stringify(note.content)}\n\n`;
        });

        promptContext += "--- SECRET NOTES ---\n";
        secretNotes.forEach(note => {
            promptContext += `Title: ${note.title}\nContent: ${JSON.stringify(note.content)}\n\n`;
        });

        promptContext += "--- DIARY ENTRIES ---\n";
        diaryEntries.forEach(entry => {
            promptContext += `Date: ${entry.entryDate}\nTitle: ${entry.title}\nContent: ${JSON.stringify(entry.content)}\n\n`;
        });

        promptContext += "--- END CONTEXT ---\n";

        return promptContext;
    } catch (e) {
        console.error("Failed to build AI context", e);
        return "You are an AI assistant. Context loading failed.";
    }
}
