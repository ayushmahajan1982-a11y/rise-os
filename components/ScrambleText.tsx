"use client";

import { useEffect, useState } from "react";

const GLYPHS = [
  "0",
  "1",
  "!",
  "@",
  "#",
  "$",
  "%",
  "^",
  "&",
  "*",
  "-",
  "_",
  "+",
  "=",
];

type ScrambleTextProps = {
  children: string | number;
  className?: string;
};

export default function ScrambleText({
  children,
  className,
}: ScrambleTextProps) {
  const text = String(children);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let frame = 0;
    const startedAt = performance.now();

    const scramble = (now: number) => {
      const elapsed = now - startedAt;
      const nextText = [...text]
        .map((character, index) => {
          if (character === " ") return " ";
          if (elapsed >= (index + 1) * 100) return character;

          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join("");

      setDisplayText(nextText);

      if (elapsed < text.length * 100) {
        frame = requestAnimationFrame(scramble);
      } else {
        setDisplayText(text);
      }
    };

    frame = requestAnimationFrame(scramble);
    return () => cancelAnimationFrame(frame);
  }, [text]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">{displayText}</span>
    </span>
  );
}
