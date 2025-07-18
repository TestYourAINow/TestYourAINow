"use client";

import { useState, useEffect } from "react";

type AgentInitialData = {
  name?: string;
  industry?: string;
  language?: string;
  template?: string;
};

export default function AgentBuilderSteps({
  initialValues,
}: {
  initialValues?: AgentInitialData;
}) {
  const [step, setStep] = useState<1 | 2>(1);

  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState("");
  const [tone, setTone] = useState("");
  const [rules, setRules] = useState("");
  const [faq, setFaq] = useState("");
  const [temperature, setTemperature] = useState("");
  const [topP, setTopP] = useState("");

  useEffect(() => {
    // Pré-remplissage à partir des valeurs du modal
    if (initialValues) {
      if (initialValues.name) setDescription(initialValues.name);
      if (initialValues.language) setTone(initialValues.language);
      // Tu peux adapter les correspondances ici selon ta logique plus tard
    }
  }, [initialValues]);

  return (
    <div className="mt-8">
      {/* Onglets Step 1 / Step 2 */}
      <div className="flex gap-4 border-b border-gray-700 mb-6">
        <button
          onClick={() => setStep(1)}
          className={`pb-2 text-sm font-medium ${
            step === 1 ? "border-b-2 border-blue-500 text-white" : "text-gray-400"
          }`}
        >
          Step 1: Personality & Purpose
        </button>
        <button
          onClick={() => setStep(2)}
          className={`pb-2 text-sm font-medium ${
            step === 2 ? "border-b-2 border-blue-500 text-white" : "text-gray-400"
          }`}
        >
          Step 2: Knowledge & Rules
        </button>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              rows={3}
              className="w-full bg-[#1a1a1a] border border-gray-700 p-3 rounded text-white"
              placeholder="Describe what this AI agent does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">What questions should the user ask?</label>
            <textarea
              rows={3}
              className="w-full bg-[#1a1a1a] border border-gray-700 p-3 rounded text-white"
              placeholder="Example: How do I reset my password?"
              value={questions}
              onChange={(e) => setQuestions(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Style, tone or language preferences</label>
            <input
              className="w-full bg-[#1a1a1a] border border-gray-700 p-2 rounded text-white"
              placeholder="Friendly, professional, casual..."
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Rules</label>
            <textarea
              rows={4}
              className="w-full bg-[#1a1a1a] border border-gray-700 p-3 rounded text-white"
              placeholder="Example: Always start with a greeting. Never mention prices."
              value={rules}
              onChange={(e) => setRules(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">FAQ / Company Knowledge (Optional)</label>
            <textarea
              rows={4}
              className="w-full bg-[#1a1a1a] border border-gray-700 p-3 rounded text-white"
              placeholder="Paste your FAQ or company info here..."
              value={faq}
              onChange={(e) => setFaq(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm text-gray-400 mb-1">Temperature</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                className="w-full bg-[#1a1a1a] border border-gray-700 p-2 rounded text-white"
                placeholder="e.g. 0.7"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm text-gray-400 mb-1">Top P</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                className="w-full bg-[#1a1a1a] border border-gray-700 p-2 rounded text-white"
                placeholder="e.g. 0.9"
                value={topP}
                onChange={(e) => setTopP(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
