/**
 * AI GUARDRAILS MODULE
 *
 * Defense-in-depth approach to securing LLM interactions.
 * Layer 1: Input sanitization (before sending to AI)
 * Layer 2: Output validation (after receiving from AI)
 * Layer 3: Policy override (deterministic rules trump AI)
 */

// ─── Layer 1: Input Sanitization ───

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|rules?|prompts?)/gi,
  /you\s+are\s+now/gi,
  /new\s+instructions?/gi,
  /override\s+(all\s+)?(rules?|instructions?|policies?)/gi,
  /disregard\s+(all\s+)?(previous|prior|above)/gi,
  /system\s*:\s*/gi,
  /\[INST\]/gi,
  /\[\/INST\]/gi,
  /<<SYS>>/gi,
  /<<\/SYS>>/gi,
  /repeat\s+(the\s+)?(system\s+)?(prompt|instructions?)/gi,
  /forget\s+(all\s+)?(your\s+)?(rules?|instructions?)/gi,
  /act\s+as\s+(if\s+)?(you('re|\s+are)\s+)?(a\s+)?(unrestricted|jailbroken)/gi,
  /DAN\s+mode/gi,
  /developer\s+mode/gi,
];

/**
 * Sanitizes customer input before sending to the LLM.
 * Returns the cleaned text and a flag if injection was detected.
 */
const sanitizeInput = (userInput) => {
  if (!userInput || typeof userInput !== 'string') {
    return {
      cleaned: '',
      injectionDetected: true,
      reason: 'Empty or invalid input',
    };
  }

  // Check for injection patterns
  let injectionDetected = false;
  let matchedPatterns = [];

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(userInput)) {
      injectionDetected = true;
      matchedPatterns.push(pattern.source);
      pattern.lastIndex = 0; // Reset regex state
    }
  }

  // Remove HTML/script tags (prevent XSS via AI response)
  let cleaned = userInput.replace(/<[^>]*>/g, '');

  // Limit input length (prevent context window overflow attacks)
  cleaned = cleaned.substring(0, 1000);

  // Trim whitespace
  cleaned = cleaned.trim();

  if (cleaned.length === 0) {
    return {
      cleaned: '',
      injectionDetected: true,
      reason: 'Input empty after sanitization',
    };
  }

  return {
    cleaned,
    injectionDetected,
    matchedPatterns: injectionDetected ? matchedPatterns : [],
    reason: injectionDetected ? 'Potential prompt injection detected' : null,
  };
};

// ─── Layer 2: Output Validation ───

const VALID_DECISIONS = ['approve', 'deny', 'escalate'];

/**
 * Validates the AI's JSON response.
 * Ensures the decision is one of the allowed values and the reasoning
 * doesn't leak system information.
 */
const validateAIOutput = (aiResponse) => {
  try {
    // Parse JSON
    const parsed =
      typeof aiResponse === 'string' ? JSON.parse(aiResponse) : aiResponse;

    // Validate decision field
    if (
      !parsed.decision ||
      !VALID_DECISIONS.includes(parsed.decision.toLowerCase())
    ) {
      return {
        valid: false,
        fallback: 'escalate', // When in doubt, escalate to human
        reason: `Invalid AI decision: ${parsed.decision}. Escalating for safety.`,
      };
    }

    // Validate confidence is a number between 0 and 1
    const confidence = parseFloat(parsed.confidence);
    if (isNaN(confidence) || confidence < 0 || confidence > 1) {
      parsed.confidence = 0.5; // Default to moderate confidence
    }

    // Check for data leakage in reasoning
    const reasoning = parsed.reasoning || '';
    const leakagePatterns = [
      /system\s+prompt/i,
      /GROQ_API_KEY/i,
      /mongodb/i,
      /password/i,
      /secret/i,
      /ignore\s+previous/i,
    ];

    for (const pattern of leakagePatterns) {
      if (pattern.test(reasoning)) {
        return {
          valid: false,
          fallback: 'escalate',
          reason: 'Potential data leakage detected in AI response. Escalating.',
        };
      }
    }

    return {
      valid: true,
      decision: parsed.decision.toLowerCase(),
      reasoning: reasoning.substring(0, 500), // Cap reasoning length
      confidence: parsed.confidence,
    };
  } catch (error) {
    return {
      valid: false,
      fallback: 'escalate',
      reason: `Failed to parse AI response: ${error.message}. Escalating for safety.`,
    };
  }
};

// ─── Layer 3: Policy Override ───

/**
 * The policy engine's decision ALWAYS overrides the AI when there's a conflict
 * on hard rules. The AI only has authority on "gray area" cases.
 */
const reconcileDecisions = (policyResult, aiDecision) => {
  // Hard rules are absolute — AI cannot override
  if (policyResult === 'auto_deny') return 'denied';
  if (policyResult === 'auto_approve') return 'approved';
  if (policyResult === 'escalate') return 'escalated';

  // For "needs_ai_review" cases, trust the AI (it's been validated)
  if (policyResult === 'needs_ai_review') {
    switch (aiDecision) {
      case 'approve':
        return 'approved';
      case 'deny':
        return 'denied';
      case 'escalate':
        return 'escalated';
      default:
        return 'escalated'; // Safety fallback
    }
  }

  // Ultimate fallback
  return 'escalated';
};

module.exports = {
  sanitizeInput,
  validateAIOutput,
  reconcileDecisions,
  VALID_DECISIONS,
};
