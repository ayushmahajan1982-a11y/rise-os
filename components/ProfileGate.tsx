"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import useSound from "use-sound";
import ScrambleText from "@/components/ScrambleText";

type ProfileGateProps = {
  onSelectProfile: (name: string) => void;
};

export default function ProfileGate({
  onSelectProfile,
}: ProfileGateProps) {
  const [profiles, setProfiles] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [playHover] = useSound(
    "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
    { volume: 0.2 },
  );
  const [playClick] = useSound(
    "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
    { volume: 0.5 },
  );

  useEffect(() => {
    const saved = localStorage.getItem("nothing_profiles");

    if (saved) {
      // Loading persisted client state after mount is intentional.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfiles(JSON.parse(saved));
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex h-screen items-center justify-center bg-black px-6 text-white"
    >
      <section className="flex flex-col items-center text-center">
        <motion.h1
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="font-dot text-2xl tracking-widest sm:text-3xl"
        >
          <ScrambleText>WHO IS IMPROVING TODAY?</ScrambleText>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-8"
        >
          {profiles.map((name) => (
            <Tilt
              key={name}
              tiltMaxAngleX={15}
              tiltMaxAngleY={15}
              scale={1.05}
              transitionSpeed={400}
              glareEnable={false}
              tiltReverse={true}
            >
              <button
                type="button"
                aria-label={`Select ${name}`}
                data-magnetic
                onMouseEnter={() => playHover()}
                onClick={() => {
                  playClick();
                  onSelectProfile(name);
                }}
                className="flex h-36 w-36 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/5 font-dot text-4xl text-white backdrop-blur-md"
              >
                {name.charAt(0).toUpperCase()}
              </button>
            </Tilt>
          ))}

          {isCreating ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
            >
              <input
                autoFocus
                type="text"
                value={newName}
                placeholder="NAME..."
                aria-label="Profile name"
                onChange={(event) => setNewName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    const name = newName.trim();

                    if (!name) return;

                    const updatedProfiles = [...profiles, name];
                    setProfiles(updatedProfiles);
                    localStorage.setItem(
                      "nothing_profiles",
                      JSON.stringify(updatedProfiles),
                    );
                    setNewName("");
                    setIsCreating(false);
                  }
                }}
                className="w-36 border-0 border-b border-white bg-black px-1 py-2 font-dot text-white outline-none ring-0 placeholder:text-[#666666] focus:border-white focus:outline-none focus:ring-0"
              />
            </motion.div>
          ) : (
            <Tilt
              tiltMaxAngleX={15}
              tiltMaxAngleY={15}
              scale={1.05}
              transitionSpeed={400}
              glareEnable={false}
              tiltReverse={true}
            >
              <button
                type="button"
                aria-label="Add profile"
                data-magnetic
                onMouseEnter={() => playHover()}
                onClick={() => {
                  playClick();
                  setIsCreating(true);
                }}
                className="flex h-36 w-36 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/5 font-dot text-5xl text-white backdrop-blur-md"
              >
                +
              </button>
            </Tilt>
          )}
        </motion.div>
      </section>
    </motion.div>
  );
}
