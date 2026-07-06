"use client";

import {
  useCallback,
  useMemo,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
} from "framer-motion";
import type { PillarScores } from "@/lib/dailyScores";

type Point = {
  x: number;
  y: number;
};

type PillarDatum = {
  label: string;
  score: number;
};

const VIEWBOX_WIDTH = 600;
const VIEWBOX_HEIGHT = 500;
const CENTER = { x: VIEWBOX_WIDTH / 2, y: VIEWBOX_HEIGHT / 2 };
const MAX_RADIUS = 172;
const NODE_PULL_RADIUS = 50;
const PILLAR_COUNT = 5;

function polarPoint(index: number, radius: number): Point {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / PILLAR_COUNT;

  return {
    x: CENTER.x + radius * Math.cos(angle),
    y: CENTER.y + radius * Math.sin(angle),
  };
}

function dataPoint(index: number, score: number, scale = 1): Point {
  return polarPoint(index, MAX_RADIUS * (score / 100) * scale);
}

function pathFromPoints(points: Point[]): string {
  return `${points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ")} Z`;
}

type LiquidNodeProps = {
  index: number;
  datum: PillarDatum;
  onOffsetChange: (index: number, x: number, y: number) => void;
};

function LiquidNode({ index, datum, onOffsetChange }: LiquidNodeProps) {
  const basePoint = dataPoint(index, datum.score);
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const x = useSpring(targetX, { stiffness: 220, damping: 18, mass: 0.25 });
  const y = useSpring(targetY, { stiffness: 220, damping: 18, mass: 0.25 });
  const breathingPoints = [0.98, 1.02, 0.98].map((scale) =>
    dataPoint(index, datum.score, scale),
  );

  useMotionValueEvent(x, "change", (latestX) => {
    onOffsetChange(index, latestX, y.get());
  });

  useMotionValueEvent(y, "change", (latestY) => {
    onOffsetChange(index, x.get(), latestY);
  });

  const pullTowardPointer = (event: ReactMouseEvent<SVGCircleElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    const screenMatrix = svg?.getScreenCTM();

    if (!screenMatrix) return;

    const pointer = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      screenMatrix.inverse(),
    );
    const nodeX = basePoint.x + x.get();
    const nodeY = basePoint.y + y.get();
    const vectorX = pointer.x - nodeX;
    const vectorY = pointer.y - nodeY;
    const distance = Math.hypot(vectorX, vectorY);

    if (distance <= NODE_PULL_RADIUS) {
      const pullStrength = 0.24 * (1 - distance / NODE_PULL_RADIUS);
      targetX.set(vectorX * pullStrength);
      targetY.set(vectorY * pullStrength);
    }
  };

  const releaseNode = () => {
    targetX.set(0);
    targetY.set(0);
  };

  const breathingTransition = {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut" as const,
  };

  return (
    <g>
      <motion.circle
        cx={basePoint.x}
        cy={basePoint.y}
        r={NODE_PULL_RADIUS}
        fill="transparent"
        animate={{
          cx: breathingPoints.map((point) => point.x),
          cy: breathingPoints.map((point) => point.y),
        }}
        transition={breathingTransition}
        style={{ x, y }}
        onMouseMove={pullTowardPointer}
        onMouseLeave={releaseNode}
      />
      <motion.circle
        cx={basePoint.x}
        cy={basePoint.y}
        r={6}
        fill="#000000"
        stroke="#FFFFFF"
        strokeWidth={2}
        animate={{
          cx: breathingPoints.map((point) => point.x),
          cy: breathingPoints.map((point) => point.y),
        }}
        transition={breathingTransition}
        style={{ x, y, pointerEvents: "none" }}
      />
      <motion.circle
        cx={basePoint.x}
        cy={basePoint.y}
        r={2}
        fill="#FF0000"
        animate={{
          cx: breathingPoints.map((point) => point.x),
          cy: breathingPoints.map((point) => point.y),
        }}
        transition={breathingTransition}
        style={{ x, y, pointerEvents: "none" }}
      />
    </g>
  );
}

type LiquidGraphProps = {
  scores: PillarScores;
};

export default function LiquidGraph({ scores }: LiquidGraphProps) {
  const data = useMemo<PillarDatum[]>(
    () => [
      { label: "HEALTH", score: scores.health },
      { label: "STUDIES", score: scores.studies },
      { label: "FUTURE", score: scores.future },
      { label: "RELATIONSHIP", score: scores.relationship },
      { label: "MONEY", score: scores.money },
    ],
    [scores],
  );
  const [nodeOffsets, setNodeOffsets] = useState<Point[]>(() =>
    Array.from({ length: PILLAR_COUNT }, () => ({ x: 0, y: 0 })),
  );

  const updateNodeOffset = useCallback(
    (index: number, x: number, y: number) => {
      setNodeOffsets((current) => {
        const previous = current[index];

        if (
          Math.abs(previous.x - x) < 0.05 &&
          Math.abs(previous.y - y) < 0.05
        ) {
          return current;
        }

        const next = [...current];
        next[index] = { x, y };
        return next;
      });
    },
    [],
  );

  const breathingPaths = useMemo(
    () =>
      [0.98, 1.02, 0.98].map((scale) =>
        pathFromPoints(
          data.map((datum, index) => {
            const point = dataPoint(index, datum.score, scale);
            return {
              x: point.x + nodeOffsets[index].x,
              y: point.y + nodeOffsets[index].y,
            };
          }),
        ),
      ),
    [data, nodeOffsets],
  );

  const gridRings = [0.25, 0.5, 0.75, 1];

  return (
    <motion.svg
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      role="img"
      aria-labelledby="liquid-graph-title liquid-graph-description"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="h-auto w-full overflow-visible"
    >
      <title id="liquid-graph-title">Life pillar balance</title>
      <desc id="liquid-graph-description">
        Interactive radar graph showing scores for health, studies, future,
        relationship, and money.
      </desc>

      {gridRings.map((ring) => (
        <path
          key={ring}
          d={pathFromPoints(
            data.map((_, index) => polarPoint(index, MAX_RADIUS * ring)),
          )}
          fill="none"
          stroke={ring === 1 ? "#333333" : "#1A1A1A"}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {data.map((_, index) => {
        const endpoint = polarPoint(index, MAX_RADIUS);
        return (
          <line
            key={index}
            x1={CENTER.x}
            y1={CENTER.y}
            x2={endpoint.x}
            y2={endpoint.y}
            stroke="#1A1A1A"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}

      <motion.path
        d={breathingPaths[0]}
        animate={{ d: breathingPaths }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        fill="#FFFFFF"
        fillOpacity={0.06}
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {data.map((datum, index) => (
        <LiquidNode
          key={datum.label}
          index={index}
          datum={datum}
          onOffsetChange={updateNodeOffset}
        />
      ))}

      {data.map((datum, index) => {
        const labelPoint = polarPoint(index, MAX_RADIUS + 34);
        return (
          <text
            key={datum.label}
            x={labelPoint.x}
            y={labelPoint.y}
            fill="#FFFFFF"
            fontSize={12}
            fontFamily="var(--font-dot)"
            letterSpacing="0.12em"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {datum.label}
          </text>
        );
      })}

      <circle cx={CENTER.x} cy={CENTER.y} r={2} fill="#FF0000" />
    </motion.svg>
  );
}
