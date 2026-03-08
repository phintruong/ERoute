"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

interface Feature {
  step: string;
  title?: string;
  content: string;
  image: string;
}

interface FeatureStepsProps {
  features: Feature[];
  className?: string;
  title?: string;
  subtitle?: string;
  autoPlayInterval?: number;
  imageHeight?: string;
}

export function FeatureSteps({
  features,
  className,
  title = "How to get Started",
  subtitle,
  autoPlayInterval = 3000,
  imageHeight = "h-[400px]",
}: FeatureStepsProps) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useInView(sectionRef, { once: false, margin: "-100px" });

  useEffect(() => {
    if (!isVisible) return;
    const timer = setInterval(() => {
      if (progress < 100) {
        setProgress((prev) => prev + 100 / (autoPlayInterval / 100));
      } else {
        setCurrentFeature((prev) => (prev + 1) % features.length);
        setProgress(0);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [progress, features.length, autoPlayInterval, isVisible]);

  const goToStep = useCallback((index: number) => {
    setCurrentFeature(index);
    setProgress(0);
  }, []);

  return (
    <div ref={sectionRef} className={cn("p-8 md:p-12", className)}>
      <div className="max-w-7xl mx-auto w-full">
        <motion.h2
          className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-center text-slate-800"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
        >
          {title}
        </motion.h2>
        {subtitle && (
          <motion.p
            className="text-base md:text-lg text-slate-600 mb-10 text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
          >
            {subtitle}
          </motion.p>
        )}
        {!subtitle && <div className="mb-10" />}

        <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-10">
          <motion.div
            className="order-2 md:order-1 space-y-6"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
            }}
          >
            {features.map((feature, index) => {
              const isActive = index === currentFeature;
              return (
                <motion.div
                  key={index}
                  className={cn(
                    "flex items-start gap-5 md:gap-6 p-4 rounded-2xl cursor-pointer transition-colors",
                    isActive ? "bg-white/70 shadow-sm" : "hover:bg-white/40",
                  )}
                  variants={{
                    hidden: { opacity: 0, x: -24 },
                    show: { opacity: 1, x: 0, transition: { duration: 0.5, ease } },
                  }}
                  animate={{ opacity: isActive ? 1 : 0.55 }}
                  transition={{ duration: 0.35 }}
                  onClick={() => goToStep(index)}
                  whileHover={{ x: 4 }}
                >
                  <div className="relative shrink-0 flex flex-col items-center">
                    <motion.div
                      className={cn(
                        "w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center font-bold text-sm",
                      )}
                      animate={{
                        backgroundColor: isActive ? '#0ea5e9' : '#e0f2fe',
                        color: isActive ? '#ffffff' : '#0284c7',
                        scale: isActive ? 1.1 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    >
                      <AnimatePresence mode="wait">
                        {index < currentFeature ? (
                          <motion.span
                            key="check"
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 90 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                          >
                            ✓
                          </motion.span>
                        ) : (
                          <motion.span
                            key="num"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                          >
                            {index + 1}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {isActive && (
                      <motion.div
                        className="w-[3px] rounded-full bg-sky-200 mt-2 origin-top"
                        style={{ height: 40 }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: autoPlayInterval / 1000, ease: 'linear' }}
                        key={`progress-${currentFeature}`}
                      >
                        <motion.div
                          className="w-full rounded-full bg-sky-500 origin-top"
                          animate={{ height: `${progress}%` }}
                          transition={{ duration: 0.1, ease: 'linear' }}
                          style={{ height: `${progress}%` }}
                        />
                      </motion.div>
                    )}
                  </div>

                  <div className="flex-1 pt-1.5">
                    <motion.h3
                      className="text-lg md:text-xl font-semibold text-slate-800 mb-1"
                      animate={{ color: isActive ? '#0f172a' : '#64748b' }}
                      transition={{ duration: 0.3 }}
                    >
                      {feature.title || feature.step}
                    </motion.h3>
                    <AnimatePresence mode="wait">
                      {isActive && (
                        <motion.p
                          key={index}
                          className="text-sm md:text-base text-slate-500 leading-relaxed"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.35, ease }}
                        >
                          {feature.content}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            className={cn(
              "order-1 md:order-2 relative h-[200px] md:h-[300px] lg:h-[400px] overflow-hidden rounded-2xl",
              imageHeight,
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease, delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {features.map(
                (feature, index) =>
                  index === currentFeature && (
                    <motion.div
                      key={index}
                      className="absolute inset-0 rounded-2xl overflow-hidden"
                      initial={{ opacity: 0, scale: 1.08, filter: 'blur(8px)' }}
                      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                      transition={{ duration: 0.5, ease }}
                    >
                      <Image
                        src={feature.image}
                        alt={feature.step}
                        className="w-full h-full object-cover"
                        width={1000}
                        height={500}
                      />
                      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-900/50 via-slate-900/10 to-transparent" />

                      <motion.div
                        className="absolute bottom-4 left-5 right-5"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.4, ease }}
                      >
                        <span className="inline-block px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-white/90 bg-white/15 backdrop-blur-md rounded-full border border-white/20">
                          {feature.step}
                        </span>
                      </motion.div>
                    </motion.div>
                  ),
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
