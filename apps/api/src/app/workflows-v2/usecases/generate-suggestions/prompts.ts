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

export const EMAIL_CONTENT_PROMPT = `Generate email content that follows Tiptap JSON structure with modern, visually appealing design elements.

Rules for document structure:
- Content must be organized in a clear visual hierarchy
- Use appropriate spacing between sections
- Group related content elements together
- Maximum content width should feel comfortable to read

Rules for variables:
- Use subscriber.firstName for user's name
- Use subscriber.email for user's email
- Use payload.* for dynamic data
- Don't include {{ }} in variable names
- Variables must have attrs with id, label, fallback, and required fields
- All variable attrs must be properly set:
  - id: string (e.g., "subscriber.firstName")
  - label: must be null
  - fallback: must be null
  - required: boolean (usually false)

Rules for paragraphs:
- Each paragraph must have attrs with textAlign property
- textAlign must be exactly "left", "center", or "right"
- Default textAlign should be "left"
- Content array must contain only text or variable nodes
- Use appropriate line height for readability
- Maintain consistent spacing between paragraphs

Rules for buttons:
- Must have attrs with all required properties:
  - text: string (clear call-to-action text)
  - url: string
  - alignment: exactly "left", "center", or "right"
  - variant: exactly "filled", "outline", or "ghost"
  - borderRadius: exactly "none", "smooth", or "round"
  - buttonColor: string (hex color, use brand colors)
  - textColor: string (hex color, ensure good contrast)
  - showIfKey: must be null
- Buttons should stand out visually
- Use action-oriented text
- Maintain proper spacing around buttons

Rules for spacers:
- Must have attrs with:
  - height: exactly "sm" (16px), "md" (24px), or "lg" (32px)
  - showIfKey: must be null
- Use consistently to create visual rhythm
- Add extra spacing before and after important elements

Rules for dividers:
- Use to separate distinct content sections
- Must have attrs with:
  - color: string (hex color, usually light gray)
  - showIfKey: must be null

Visual Hierarchy Guidelines:
1. Start with a prominent header or greeting
2. Follow with clear, scannable content sections
3. Use spacers to create breathing room
4. End with a clear call-to-action button
5. Add footer information if needed

Example structure:
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "attrs": { "textAlign": "left" },
      "content": [
        { "type": "text", "text": "Hi " },
        { 
          "type": "variable", 
          "attrs": { 
            "id": "subscriber.firstName",
            "label": null,
            "fallback": null,
            "required": false 
          }
        }
      ]
    },
    {
      "type": "spacer",
      "attrs": {
        "height": "md",
        "showIfKey": null
      }
    },
    {
      "type": "paragraph",
      "attrs": { "textAlign": "left" },
      "content": [
        { "type": "text", "text": "Welcome to our service! We're excited to have you on board." }
      ]
    },
    {
      "type": "spacer",
      "attrs": {
        "height": "lg",
        "showIfKey": null
      }
    },
    {
      "type": "button",
      "attrs": {
        "text": "Get Started",
        "url": "https://example.com",
        "alignment": "center",
        "variant": "filled",
        "borderRadius": "smooth",
        "buttonColor": "#0042DA",
        "textColor": "#ffffff",
        "showIfKey": null
      }
    }
  ]
}

Always include:
- Clear visual hierarchy with proper spacing
- Personalized greeting with subscriber.firstName in a prominent position
- Scannable content structure with appropriate spacers
- Professional, on-brand design elements
- Prominent call-to-action button with proper styling
- Consistent spacing and alignment throughout
- Mobile-responsive design considerations
- All required attributes for each element type
- Only use allowed element types: paragraph, button, spacer, and divider
- Ensure all attributes match their exact allowed values`;

export const IN_APP_CONTENT_PROMPT = `Generate in-app notification content that is concise and actionable.

Rules:
- Keep it short and clear
- Use {{subscriber.firstName}} for personalization
- Use {{payload.*}} for dynamic data
- Include call to action when relevant
- Use proper liquid syntax with {{ }} for variables
- You can use ** to bold text
- Don't wrap the result in \`\`\`liquid
- Don't start with Hi, Hello, or anything like that. Focus on the content and the call to action

Example: Your order #{{payload.orderNumber}} has been shipped!`;

export const PUSH_CONTENT_PROMPT = `Generate push notification content that is attention-grabbing but professional.

Rules:
- Keep it under 140 characters
- Use {{subscriber.firstName}} for personalization
- Use {{payload.*}} for dynamic data
- Be direct and clear
- Use proper liquid syntax with {{ }}

Example: {{subscriber.firstName}}, your order is out for delivery!`;

export const SMS_CONTENT_PROMPT = `Generate SMS content that is concise and informative.

Rules:
- Keep it under 160 characters
- Use {{subscriber.firstName}} for personalization
- Use {{payload.*}} for dynamic data
- Be direct and clear
- Include call to action when needed
- Use proper liquid syntax with {{ }}

Example: Hi {{subscriber.firstName}}, your appointment is confirmed for {{payload.time}}. Reply YES to confirm.`;

export const CHAT_CONTENT_PROMPT = `Generate chat message content that is conversational yet professional.

Rules:
- Keep it concise but friendly
- Use {{subscriber.firstName}} for personalization
- Use {{payload.*}} for dynamic data
- Include relevant details
- Use proper liquid syntax with {{ }}

Example: Hi {{subscriber.firstName}}! Just letting you know that your order #{{payload.orderNumber}} has been confirmed.`;

const COMMON_PROMPT_INSTRUCTIONS = `Variable Usage Rules:
- For SMS, Push, In-App, and Chat channels: Use liquid syntax with either subscriber or payload prefix.
  Examples: 
  - {{subscriber.firstName}}
  - {{payload.orderNumber}}
  - {{subscriber.email}}
  - {{payload.amount}}

For email steps, structure the body as a Tiptap JSON document and don't wrap the variables with {{ with this format:
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
