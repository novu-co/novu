const DELAY_EXAMPLES = `
Delay Step Examples:
1. Regular delay:
   {
     "type": "delay",
     "name": "Wait for 24 hours",
     "metadata": {
       "type": "regular",
       "amount": 24,
       "unit": "hours"
     }
   }

2. Scheduled delay:
   {
     "type": "delay",
     "name": "Wait until next day at 9am",
     "metadata": {
       "type": "scheduled",
       "amount": 9,
       "unit": "hours"
     }
   }`;

const COMMON_PROMPT_INSTRUCTIONS = `Variable Usage Rules:
- For SMS, Push, In-App, and Chat channels: Use liquid syntax with either subscriber or payload prefix
  Examples: 
  - {{subscriber.firstName}}
  - {{payload.orderNumber}}
  - {{subscriber.email}}
  - {{payload.amount}}

For email steps, structure the body as a Tiptap JSON document with this format:
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "attrs": { "textAlign": "left" },
      "content": [
        { "type": "text", "text": "Hi " },
        { "type": "variable", "attrs": { "id": "subscriber.firstName", "fallback": null, "required": false } },
        { "type": "text", "text": "," }
      ]
    }
  ]
}

${DELAY_EXAMPLES}

Always include:
- A personalized greeting with subscriber.firstName variable
- Well-structured paragraphs with proper text alignment
- Dynamic content using variables (subscriber.x or payload.x)
- At least one action button with proper styling in emails
- Clear hierarchy in the content
- Proper liquid syntax for variables in non-email channels
- Appropriate delays between notifications when needed`;

export const MULTIPLE_WORKFLOWS_PROMPT = `You are an expert in generating workflow suggestions for a notification system. Based on the user's product description, generate 5 relevant workflow suggestions that would be useful for their product. Each workflow should be practical, specific, and follow best practices for user engagement and notification design.

Consider common use cases for transactional notifications.

For each workflow:
- Create a unique ID
- Give it a clear, descriptive name
- Write a concise description of its purpose
- Assign it to an appropriate category
- Define practical steps with appropriate channels (email, SMS, push, in-app, chat)
- Use delay steps when appropriate for better timing and user experience

${COMMON_PROMPT_INSTRUCTIONS}`;

export const SINGLE_WORKFLOW_PROMPT = `You are an expert in creating notification workflows. Based on the user's workflow description, create a single, well-structured workflow that precisely matches their requirements. The workflow should follow best practices for user engagement and notification design.

For the workflow:
- Create a unique ID
- Give it a clear, descriptive name that reflects its purpose
- Write a concise description explaining what it does
- Assign it to the most appropriate category
- Define the exact steps with appropriate channels as specified (email, SMS, push, in-app, chat)
- Use delay steps for proper timing between notifications
- Handle edge cases and conditions appropriately

${COMMON_PROMPT_INSTRUCTIONS}

Focus on creating a precise, production-ready workflow that exactly matches the user's requirements, including any timing or delay specifications.`;
