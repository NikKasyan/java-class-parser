import { extractFromRawClassFile } from "./lib/class-parser";
import {
  parseRawClassFile,
  parseRawClassFileWithOffsetsFromRawFile,
} from "./lib/raw-class-parser";

const input = document.querySelector<HTMLInputElement>("input")!;
const outputHex = document.querySelector<HTMLPreElement>("#output-hex")!;

const formatHex = (bytes: Uint8Array) => {
  const hex = Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join(" ");
  return hex;
};
input.addEventListener("change", (event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    readFile(file);
  }
});

const readFile = (file: File) => {
  const reader = new FileReader();

  reader.onload = () => {
    const content = reader.result as ArrayBuffer;
    const array = new Uint8Array(content);
    const rawClass = parseRawClassFile(array);
    const parsedRawWithOffsets = parseRawClassFileWithOffsetsFromRawFile(
      rawClass,
      array
    );
    const parsed = extractFromRawClassFile(rawClass, false);
    outputHex.textContent = formatHex(array);
    console.log(parsedRawWithOffsets);
    console.log(rawClass);
    console.log(parsed);
  };

  reader.onerror = () => {
    console.error("Error reading file");
  };
  reader.readAsArrayBuffer(file);
};
