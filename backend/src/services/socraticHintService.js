/**
 * socraticHintService.js  —  Phase 5: Context-Aware Socratic AI Mentorship
 * ────────────────────────────────────────────────────────────────────────
 * Generates progressive 3-tier scaffolding hints:
 *   Level 1 (Concept)    : Explains core algorithm intuition without code.
 *   Level 2 (Edge Case)  : Highlights edge-case pitfalls & boundary conditions.
 *   Level 3 (Pseudocode) : Outlines high-level algorithmic steps with blanks.
 *
 * Socratic Constraint: The model is strictly instructed NEVER to provide
 * complete or copy-pasteable solutions.
 */

const axios = require('axios');

const HINT_TIER_NAMES = {
  1: 'CONCEPTUAL_NUDGE',
  2: 'EDGE_CASE_DIAGNOSTIC',
  3: 'PSEUDOCODE_SCAFFOLD'
};

const SYSTEM_INSTRUCTION = `
You are an expert Socratic Computer Science tutor on the AdaptLearn platform.
Your pedagogical goal is to guide the student to discover the solution themselves.

STRICT RULES:
1. NEVER write direct working code or complete Python functions.
2. If level is 1 (CONCEPTUAL_NUDGE): Explain the core algorithmic idea or data structure choice. Do not mention specific code syntax.
3. If level is 2 (EDGE_CASE_DIAGNOSTIC): Focus on boundary cases (empty lists, duplicates, negative numbers, off-by-one indices). Ask a thought-provoking diagnostic question.
4. If level is 3 (PSEUDOCODE_SCAFFOLD): Provide a 4-6 line high-level pseudocode outline with placeholders/blanks that the student must fill.
5. Keep your answer concise, pedagogical, and under 150 words.
6. Address the student warmly and encouragingly.
`;

// Deterministic intelligent fallback if Gemini API key is not yet configured or offline
const generateRuleBasedHint = (problem, level, astSummary) => {
  const title = problem.title || '';
  const tags = problem.concept_tags || [];

  if (level === 1) {
    if (tags.includes('hash map')) {
      return `💡 Conceptual Nudge: Notice how searching an array takes O(n) time. Can you store elements you've already seen in a key-value structure so lookup drops to O(1)? What would the key and value represent?`;
    }
    if (tags.includes('binary search')) {
      return `💡 Conceptual Nudge: Because the list is already sorted, you can eliminate half of the search space on each step. How does comparing the middle element with your target determine which half to discard?`;
    }
    if (tags.includes('two pointers')) {
      return `💡 Conceptual Nudge: Consider positioning two markers—perhaps one at the start and one at the end. How can moving them inward under specific conditions converge on the solution without extra memory?`;
    }
    if (tags.includes('dynamic programming')) {
      return `💡 Conceptual Nudge: Does solving this larger problem depend on the optimal solutions to smaller subproblems? How can you cache prior calculations to avoid recalculating the same states?`;
    }
    return `💡 Conceptual Nudge: Analyze the problem requirements and time constraints. What primary data structure matches this access pattern?`;
  }

  if (level === 2) {
    if (title.includes('Two Sum')) {
      return `⚠️ Edge Case Check: What happens if the complement is the exact same element at the same index? Ensure an element cannot be added to itself to reach the target!`;
    }
    if (title.includes('Binary Search')) {
      return `⚠️ Edge Case Check: Pay close attention to loop termination: is your condition \`left <= right\` or \`left < right\`? What happens when the target is smaller than the very first item?`;
    }
    if (title.includes('Palindrome')) {
      return `⚠️ Edge Case Check: How does your code handle non-alphanumeric characters, single-letter words, or an empty string? What about case sensitivity?`;
    }
    if (title.includes('Kadane') || title.includes('Subarray')) {
      return `⚠️ Edge Case Check: What if every single number in the array is negative? Does your maximum sum default to 0 or to the least negative number?`;
    }
    return `⚠️ Edge Case Check: Test your solution against empty input, single-element input, and extreme values. Where could an index out-of-bounds or zero-division occur?`;
  }

  // Level 3 Pseudocode
  if (title.includes('Two Sum')) {
    return `📝 Pseudocode Scaffold:\n1. Initialize seen_map = {}\n2. For index, num in enumerate(nums):\n     complement = target - num\n     if complement in seen_map: return [seen_map[complement], index]\n     seen_map[num] = index\n3. Return empty list if no pair found`;
  }
  if (title.includes('Binary Search')) {
    return `📝 Pseudocode Scaffold:\n1. left = 0, right = length - 1\n2. While left <= right:\n     mid = (left + right) // 2\n     if nums[mid] == target: return mid\n     else if nums[mid] < target: left = mid + 1\n     else: right = mid - 1\n3. Return -1 if not found`;
  }

  return `📝 Pseudocode Scaffold:\n1. Initialize boundary pointers / accumulator\n2. Iterate through input elements with clear invariants\n3. Update intermediate state based on condition\n4. Return computed result`;
};

exports.getSocraticHint = async ({
  problem,
  code,
  executionError,
  astSummary,
  skillState,
  hintLevel = 1,
  studentName = 'Learner'
}) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const promptContext = `
Student Name: ${studentName}
Problem: "${problem.title}" (${problem.difficulty})
Concept Tags: ${problem.concept_tags?.join(', ')}
Expected Complexity: ${problem.complexity_expected || 'Not specified'}

Student's Submitted Code:
\`\`\`python
${code || '# No code submitted yet'}
\`\`\`

Execution / Test Error:
${executionError || 'Tests failed due to output mismatch.'}

AST Structural Analysis:
${JSON.stringify(astSummary || {})}

Student Topic Mastery Context:
${JSON.stringify(skillState || {})}

Requested Hint Tier: Level ${hintLevel} (${HINT_TIER_NAMES[hintLevel] || 'CONCEPTUAL_NUDGE'})

Please provide a supportive, pedagogical Socratic response fitting Level ${hintLevel}. Remember: DO NOT give working solution code.
`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              { text: SYSTEM_INSTRUCTION + '\n\n' + promptContext }
            ]
          }
        ]
      };

      const response = await axios.post(url, payload, { timeout: 8000 });
      const candidates = response.data?.candidates;
      if (candidates && candidates.length > 0 && candidates[0].content?.parts?.length > 0) {
        return candidates[0].content.parts[0].text.trim();
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to rule-based tutor:', err.message);
    }
  }

  return generateRuleBasedHint(problem, hintLevel, astSummary);
};
