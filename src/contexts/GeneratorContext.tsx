import { createContext, useContext, useState } from "react";

export const roomTypes = ["bedroom", "living room"];

export const roomStyles = ["modern", "minimalist", "comtemporary"];

interface GeneratorContextInterface {
  roomType: string | undefined;
  setRoomType: (value: string) => void | null;
  roomStyle: string | undefined;
  setRoomStyle: (value: string) => void | null;
  imageName: string | null;
  setImageName: (value: string | null) => void | null;
  originalImage: string | null;
  setOriginalImage: (value: string | null) => void | null;
  generatedImage: string | null;
  setGeneratedImage: (value: string | null) => void | null;
  noBgOriginalImage: string | null;
  setNoBgOriginalImage: (value: string | null) => void | null;
  maskedOriginalImage: string | null;
  setMaskedOriginalImage: (value: string | null) => void | null;
  resultLoading: boolean;
  setResultLoading: (value: boolean) => void | null;
}

const GeneratorContext = createContext<GeneratorContextInterface | undefined>(
  undefined
);

export function useGenerator() {
  const context = useContext(GeneratorContext);
  if (context === undefined) {
    throw new Error("useGenerator must be within GeneratorProvider");
  }
  return context;
}

export function GeneratorProvider({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [roomType, setRoomType] = useState<string>(roomTypes[0]);
  const [roomStyle, setRoomStyle] = useState<string>(roomStyles[0]);

  const [imageName, setImageName] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>("https://upcdn.io/12a1y2r/image/furniture-to-room/test-furniture-2-6WiB.jpg?w=600&h=600&fit=max&q=70");
  const [noBgOriginalImage, setNoBgOriginalImage] = useState<string | null>(
    null
  );
  const [maskedOriginalImage, setMaskedOriginalImage] = useState<string | null>(
    null
  );
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [resultLoading, setResultLoading] = useState(false);

  const value = {
    roomType,
    setRoomType,
    roomStyle,
    setRoomStyle,
    imageName,
    setImageName,
    originalImage,
    setOriginalImage,
    generatedImage,
    setGeneratedImage,
    noBgOriginalImage,
    setNoBgOriginalImage,
    maskedOriginalImage,
    setMaskedOriginalImage,
    resultLoading,
    setResultLoading,
  };
  return (
    <GeneratorContext.Provider value={value}>
      {children}
    </GeneratorContext.Provider>
  );
}
