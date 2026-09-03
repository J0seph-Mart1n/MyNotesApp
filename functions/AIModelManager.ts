import * as FileSystem from 'expo-file-system/legacy';
import { initLlama, LlamaContext } from 'llama.rn';

export const MODEL_FILENAME = 'qwen1.5-0.5b-chat-q4_k_m.gguf';
// A very small model suitable for mobile test (~398MB)
export const MODEL_URL = 'https://huggingface.co/Qwen/Qwen1.5-0.5B-Chat-GGUF/resolve/main/qwen1_5-0_5b-chat-q4_k_m.gguf?download=true';

export const getModelPath = () => {
  // @ts-ignore
  return `${FileSystem.documentDirectory}${MODEL_FILENAME}`;
};

export const checkModelExists = async () => {
  const path = getModelPath();
  // @ts-ignore
  const info = await FileSystem.getInfoAsync(path);
  return info.exists;
};

export const downloadModel = async (
  onProgress: (progress: number) => void
) => {
  const path = getModelPath();
  // @ts-ignore
  const downloadResumable = FileSystem.createDownloadResumable(
    MODEL_URL,
    path,
    {},
    (downloadProgress) => {
      const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
      onProgress(progress);
    }
  );

  try {
    const result = await downloadResumable.downloadAsync();
    return result?.uri;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

let context: LlamaContext | null = null;

export const loadModel = async () => {
  if (context) return context;
  
  const path = getModelPath();
  
  // Initialize llama.rn context
  context = await initLlama({
    model: path,
    use_mlock: true,
    n_ctx: 2048,
    n_gpu_layers: 1, // Will use metal/opencl if available
  });
  
  return context;
};

export const releaseModel = async () => {
    if (context) {
        await context.release();
        context = null;
    }
};
