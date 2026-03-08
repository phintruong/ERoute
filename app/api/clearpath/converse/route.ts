import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are ERoute's emergency intake AI. You triage patients fast so we can route them to the right ER.

Rules:
1. Ask ONE short question at a time. Max 1-2 sentences per response.
2. NO filler. No "I'm sorry to hear that", no "That sounds concerning", no "I understand". Jump straight to the next question or action.
3. If something sounds dangerous, give ONE immediate instruction: "Apply pressure to the wound." / "Sit upright." / "Don't move." / "Call 911 now." Then immediately triage.
4. Gather: what happened, pain level (1-10), breathing okay?
5. You MUST complete triage within 2-3 user messages. After the user's 2nd reply you MUST triage on your next response. Do NOT ask more than 3 questions total.
6. Your FINAL message before triage must say exactly: "Got it. We're routing you to the nearest ER now."

CRITICAL RULES:
- NEVER output JSON, code blocks, or structured data in your spoken text.
- When you have enough info (or after 2-3 exchanges — whichever comes first), you MUST add a line at the very end starting with "TRIAGE_RESULT:" followed by triage JSON:
TRIAGE_RESULT:{"severity": "critical|urgent|non-urgent", "reasoning": "brief explanation", "done": true, "symptoms": {"chestPain": false, "shortnessOfBreath": false, "fever": false, "dizziness": false, "freeText": "summary"}}
- The TRIAGE_RESULT line is stripped before display — the patient never sees it.
- If you are unsure, err toward "urgent". NEVER keep chatting to gather more info past 3 exchanges.

Severity:
- critical: Life-threatening (severe chest pain, stroke, major trauma, can't breathe, uncontrolled bleeding)
- urgent: Needs prompt care (moderate-severe pain, high fever, worsening, possible fracture)
- non-urgent: Can wait (mild stable pain, minor injury, cold/flu)

Be direct. Every word counts. TRIAGE FAST.`;

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body as { messages: Message[] };

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });
    const modelId = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

    const userMessageCount = messages.filter(m => m.role === 'user').length;

    // Hard cutoff: if 5+ user messages, force triage from conversation history
    if (userMessageCount >= 5) {
      const conversationSummary = messages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .join('; ');
      return NextResponse.json({
        reply: "Got it. We're routing you to the nearest ER now.",
        triage: {
          severity: 'urgent' as const,
          reasoning: `Auto-triaged after extended conversation: ${conversationSummary.slice(0, 200)}`,
          symptoms: { chestPain: false, shortnessOfBreath: false, fever: false, dizziness: false, freeText: conversationSummary.slice(0, 300) },
        },
      });
    }

    const fullMessages: Message[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ];

    // After 3 user messages, inject a hard nudge to force triage NOW
    if (userMessageCount >= 3) {
      fullMessages.push({
        role: 'system',
        content: 'You have enough information. You MUST triage NOW. Say "Got it. We\'re routing you to the nearest ER now." and include the TRIAGE_RESULT line. Do NOT ask any more questions.',
      });
    }

    const result = await openai.chat.completions.create({
      model: modelId,
      temperature: 0.4,
      max_tokens: 300,
      messages: fullMessages,
    });

    const text = result.choices[0]?.message?.content ?? '';

    // Extract triage JSON from the response — greedy match to handle nested braces
    let triage = null;

    // TRIAGE_RESULT: format — grab everything from the opening { to the end of the string
    const triageMatch = /TRIAGE_RESULT:\s*(\{[\s\S]*\})\s*$/.exec(text);
    if (triageMatch) {
      try {
        const parsed = JSON.parse(triageMatch[1].trim());
        if (parsed.done && parsed.severity && parsed.reasoning) {
          triage = {
            severity: parsed.severity,
            reasoning: parsed.reasoning,
            symptoms: parsed.symptoms || null,
          };
        }
      } catch {
        // Not valid JSON, ignore
      }
    }

    // Legacy ```json format fallback
    if (!triage) {
      const jsonMatch = /```json\s*([\s\S]*?)```/.exec(text);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1].trim());
          if (parsed.done && parsed.severity && parsed.reasoning) {
            triage = {
              severity: parsed.severity,
              reasoning: parsed.reasoning,
              symptoms: parsed.symptoms || null,
            };
          }
        } catch {
          // Not valid JSON, ignore
        }
      }
    }

    // Clean the display text — strip all machine-readable data so only natural speech remains
    let displayText = text
      .replace(/TRIAGE_RESULT:\s*\{[\s\S]*\}\s*$/g, '')     // TRIAGE_RESULT line (greedy)
      .replace(/```json[\s\S]*?```/g, '')                     // ```json blocks
      .replace(/\{[^}]*"severity"\s*:[\s\S]*\}/g, '')         // any raw JSON with "severity"
      .replace(/\{[^}]*"done"\s*:\s*true[\s\S]*\}/g, '')      // any raw JSON with "done": true
      .trim();

    return NextResponse.json({
      reply: displayText,
      triage,
    });
  } catch (err) {
    console.error('Converse API error:', err);
    return NextResponse.json(
      { error: 'Conversation failed. Please try again.' },
      { status: 500 }
    );
  }
}
