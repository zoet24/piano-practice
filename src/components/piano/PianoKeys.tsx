interface PianoKeysProps {
  activeKeys: number[];
  className?: string;
}

export function PianoKeys({ activeKeys, className = "" }: PianoKeysProps) {
  // Piano key pattern: white keys at even indices, black keys at odd indices
  const keys = [
    { type: "white", note: "C", keyIndex: 0 },
    { type: "black", note: "C#", keyIndex: 1 },
    { type: "white", note: "D", keyIndex: 2 },
    { type: "black", note: "D#", keyIndex: 3 },
    { type: "white", note: "E", keyIndex: 4 },
    { type: "white", note: "F", keyIndex: 5 },
    { type: "black", note: "F#", keyIndex: 6 },
    { type: "white", note: "G", keyIndex: 7 },
    { type: "black", note: "G#", keyIndex: 8 },
    { type: "white", note: "A", keyIndex: 9 },
    { type: "black", note: "A#", keyIndex: 10 },
    { type: "white", note: "B", keyIndex: 11 },
  ];

  return (
    <div className={`piano-keys ${className}`} data-testid="piano-keys">
      {keys.map((key) => (
        <div
          key={key.keyIndex}
          className={`
              ${key.type === "white" ? "white-key" : "black-key"}
              ${activeKeys.includes(key.keyIndex) ? "key-active" : ""}
            `}
          data-testid={`piano-key-${key.note}`}
          title={key.note}
        />
      ))}
    </div>
  );
}
