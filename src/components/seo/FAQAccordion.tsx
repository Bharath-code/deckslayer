"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQAccordionProps {
    faqs: FAQItem[];
    className?: string;
}

/**
 * Accessible FAQ accordion component.
 * Uses Framer Motion for smooth expand/collapse animations.
 * Schema markup is handled separately via SchemaScript component.
 */
export function FAQAccordion({ faqs, className = "" }: FAQAccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleItem = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className={`space-y-4 ${className}`} itemScope itemType="https://schema.org/FAQPage">
            {faqs.map((faq, index) => (
                <div
                    key={index}
                    className="border border-border bg-card rounded-lg overflow-hidden"
                    itemScope
                    itemProp="mainEntity"
                    itemType="https://schema.org/Question"
                >
                    <button
                        onClick={() => toggleItem(index)}
                        className="w-full flex items-center justify-between p-6 text-left hover:bg-background/50 transition-colors"
                        aria-expanded={openIndex === index}
                        aria-controls={`faq-answer-${index}`}
                    >
                        <span
                            className="font-semibold text-foreground pr-4"
                            itemProp="name"
                        >
                            {faq.question}
                        </span>
                        <ChevronDown
                            size={20}
                            className={`flex-shrink-0 text-muted transition-transform duration-200 ${openIndex === index ? "rotate-180" : ""
                                }`}
                        />
                    </button>

                    <AnimatePresence initial={false}>
                        {openIndex === index && (
                            <motion.div
                                id={`faq-answer-${index}`}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                itemScope
                                itemProp="acceptedAnswer"
                                itemType="https://schema.org/Answer"
                            >
                                <div
                                    className="px-6 pb-6 text-muted leading-relaxed"
                                    itemProp="text"
                                >
                                    {faq.answer}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}
