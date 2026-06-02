import { ImageFormat, Skia } from "@shopify/react-native-skia";
import { Buffer } from 'buffer';
import { FileArchive, FileImage, FileSpreadsheet, FileText ,File} from "lucide-react-native";

export const compressWithSkia = async (pickerResult: any) => {
  try { 
    // 1. Rename to avoid "shadowing" the 'image' variable name
    const path = pickerResult.path; 

    const data = await Skia.Data.fromURI(path);
    const skImage = Skia.Image.MakeImageFromEncoded(data); // Changed name to skImage

    if (!skImage) throw new Error("Failed to decode image"); 

    // Dynamic Quality Logic
    const sizeInMB = pickerResult.size / (1024 * 1024);
    let targetQuality = 0.1; 
    if (sizeInMB < 1) targetQuality = 0.9;
    else if (sizeInMB <= 2) targetQuality = 0.8;
    else if (sizeInMB <= 3) targetQuality = 0.7;
    else if (sizeInMB <= 4) targetQuality = 0.6;
    else if (sizeInMB <= 5) targetQuality = 0.5;
    else if (sizeInMB <= 6) targetQuality = 0.4;
    else if (sizeInMB <= 7) targetQuality = 0.3;
    else if (sizeInMB <= 8) targetQuality = 0.2; 

    // 2. Use string 'jpeg' instead of ImageFormat.JPEG
    // 3. Ensure quality is passed as an integer (0-100)
    const encodedBytes = skImage.encodeToBytes(ImageFormat.JPEG, Math.floor(targetQuality * 100)); 

    if (!encodedBytes) throw new Error("Encoding failed");

    // 4. Convert to base64
    const base64 = Buffer.from(encodedBytes).toString('base64');
    const uri = `data:image/jpeg;base64,${base64}`;

    return { 
      uri, 
      sizeInMB,
      width: skImage.width(),
      height: skImage.height()
    };

  } catch (error) {
    console.error("Compression Error:", error);
    return null;
  }
};

