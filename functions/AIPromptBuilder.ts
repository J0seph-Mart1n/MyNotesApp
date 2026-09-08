import { fetchNotes } from '@/constants/database';
import { fetchAllDiaryEntries } from '@/constants/database';

export const buildContextPrompt = async () => {
    try {
        // Fetch public notes, secret notes, and all diary entries
        const publicNotes = await fetchNotes(0);
        const secretNotes = await fetchNotes(1);
        const diaryEntries = await fetchAllDiaryEntries();

        let promptContext = "You are a highly intelligent and private AI assistant integrated into the SecretNotes app. ";
        promptContext += "You have full, unrestricted access to all of the user's data across the Notes, Secrets, and Diary pages. ";
        promptContext += "Use the provided context below to confidently and accurately answer any questions the user has about their entries.\n\n";

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
