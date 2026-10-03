/**
 * Payload Refinement Utilities for Phase 4 (Stylize)
 * Converts generated test suite JSON into Slack Block Kit, Email HTML, and Notion formats.
 */

export function toSlackBlockKit(suiteData) {
  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `🧪 QA Test Suite: ${suiteData.feature_name || 'Generated Feature'}`,
        emoji: true
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Summary:* ${suiteData.summary || 'No summary provided.'}\n*Total Test Cases:* \`${(suiteData.test_cases || []).length}\``
      }
    },
    { type: "divider" }
  ];

  (suiteData.test_cases || []).forEach(tc => {
    const priorityEmoji = tc.priority === 'P0' ? '🔴' : tc.priority === 'P1' ? '🟠' : '🟡';
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${tc.id || 'TC'}*: *${tc.title}*\n${priorityEmoji} *Priority:* ${tc.priority || 'P1'} | *Type:* ${tc.type || 'Functional'}\n*Expected Result:* _${tc.expected_result}_`
      }
    });
  });

  return { blocks };
}

export function toEmailHTML(suiteData) {
  const testRows = (suiteData.test_cases || []).map(tc => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 10px; font-weight: bold; color: #4f46e5;">${tc.id || 'TC'}</td>
      <td style="padding: 10px; font-weight: 600;">${tc.title}</td>
      <td style="padding: 10px;"><span style="background: #e0e7ff; color: #3730a3; padding: 3px 8px; border-radius: 4px; font-size: 11px;">${tc.priority}</span></td>
      <td style="padding: 10px; font-size: 13px; color: #4b5563;">${(tc.steps || []).join('<br>')}</td>
      <td style="padding: 10px; font-size: 13px; color: #059669; font-weight: 500;">${tc.expected_result}</td>
    </tr>
  `).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>QA Test Suite - ${suiteData.feature_name}</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px; color: #1f2937;">
    <div style="max-width: 800px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <h2 style="color: #111827; margin-top: 0;">🧪 QA Test Suite: ${suiteData.feature_name}</h2>
      <p style="color: #6b7280; font-size: 14px;">${suiteData.summary}</p>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="background-color: #f3f4f6; color: #374151; font-size: 12px; text-transform: uppercase;">
            <th style="padding: 10px;">ID</th>
            <th style="padding: 10px;">Title</th>
            <th style="padding: 10px;">Priority</th>
            <th style="padding: 10px;">Steps</th>
            <th style="padding: 10px;">Expected Result</th>
          </tr>
        </thead>
        <tbody>
          ${testRows}
        </tbody>
      </table>
    </div>
  </body>
  </html>
  `;
}
