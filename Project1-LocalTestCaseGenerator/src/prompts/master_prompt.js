/**
 * Master QA System Prompt Template for Local LLM Testcase Generation
 */
export function buildMasterPrompt(featureDescription, testType = 'All') {
  const testTypeFocus = {
    'Functional': 'Focus predominantly on happy path functional flows, core business logic, and standard feature execution.',
    'Negative': 'Focus predominantly on invalid inputs, missing fields, error handling, unauthorized actions, and boundary violations.',
    'Security': 'Focus predominantly on authentication bypass, input sanitization, injection, unauthorized state changes, and session safety.',
    'UI/UX': 'Focus predominantly on visual layout, responsiveness, accessibility, field validations, loading states, and user feedback.',
    'Edge Cases': 'Focus predominantly on rare scenarios, concurrency, extreme boundary values, network latency, and unexpected system states.',
    'All': 'Provide balanced coverage across Functional, Negative/Boundary, Security, UI/UX, and Edge Case scenarios.'
  }[testType] || 'Provide balanced coverage across Functional, Negative/Boundary, Security, UI/UX, and Edge Case scenarios.';

  return `You are a Principal Software Quality Assurance Engineer.
Your task is to analyze the following user requirement / feature description and generate structured QA Test Cases.

FEATURE DESCRIPTION:
"""
${featureDescription}
"""

TESTING SCOPE FOCUS:
${testTypeFocus}

CRITICAL RULES:
1. Output MUST be ONLY valid JSON matching the specified structure below.
2. Do NOT wrap the output in markdown fences like \`\`\`json. Output plain raw JSON starting with { and ending with }.
3. Ensure test case IDs follow TC-001, TC-002, etc.
4. Priorities must be one of: "P0", "P1", "P2", "P3".
5. Test case types must be one of: "Functional", "Negative", "Boundary", "Security", "UI/UX", "Performance".
6. Include clear, step-by-step instructions in "steps" array.
7. Include precise expected result in "expected_result".

REQUIRED JSON STRUCTURE:
{
  "feature_name": "Short descriptive name of the feature",
  "summary": "Brief executive summary of test coverage strategy",
  "test_cases": [
    {
      "id": "TC-001",
      "title": "Clear test case title",
      "type": "Functional",
      "priority": "P0",
      "preconditions": [
        "User is logged in",
        "Valid active session exists"
      ],
      "steps": [
        "1. Navigate to the feature page",
        "2. Input valid details into the form",
        "3. Click submit"
      ],
      "expected_result": "Success message displayed and record saved in system."
    }
  ]
}

Generate comprehensive test cases for the feature now.`;
}
