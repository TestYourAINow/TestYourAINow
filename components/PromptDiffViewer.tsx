"use client";

import { useEffect, useState } from "react";
import { diff_match_patch, Diff, DIFF_INSERT, DIFF_DELETE, DIFF_EQUAL } from "diff-match-patch";

type Props = {
  original: string;
  updated: string;
};

export default function PromptDiffViewer({ original, updated }: Props) {
  const [htmlDiff, setHtmlDiff] = useState("");

  useEffect(() => {
    const dmp = new diff_match_patch();
    const diffs: Diff[] = dmp.diff_main(original, updated);
    dmp.diff_cleanupSemantic(diffs);

    const html = diffs
      .map(([op, text]: Diff) => {
        if (op === DIFF_INSERT) {
          return `<span style="background-color:#103810;color:#8DFF8A;">${escapeHtml(text)}</span>`;
        } else if (op === DIFF_DELETE) {
          return `<span style="background-color:#3a0d0d;color:#ff9999;text-decoration:line-through;">${escapeHtml(text)}</span>`;
        } else {
          return escapeHtml(text);
        }
      })
      .join("");

    setHtmlDiff(html);
  }, [original, updated]);

  return (
    <div
      className="bg-[#121212] border border-gray-700 p-4 rounded text-sm leading-relaxed text-white whitespace-pre-wrap"
      dangerouslySetInnerHTML={{ __html: htmlDiff }}
    />
  );
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
