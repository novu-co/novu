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

export const EMAIL_CONTENT_PROMPT = `Generate email content that follows Tiptap JSON structure. Each text or variable should be in its own paragraph block.

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

Rules for buttons:
- Must have attrs with all required properties:
  - text: string
  - url: string
  - alignment: exactly "left", "center", or "right"
  - variant: exactly "filled", "outline", or "ghost"
  - borderRadius: exactly "none", "smooth", or "round"
  - buttonColor: string (hex color)
  - textColor: string (hex color)
  - showIfKey: must be null

Rules for spacers:
- Must have attrs with:
  - height: exactly "sm", "md", or "lg"
  - showIfKey: must be null

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
      "type": "paragraph",
      "attrs": { "textAlign": "left" },
      "content": [
        { "type": "text", "text": "Welcome to our service! We're excited to have you on board." }
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
      "type": "button",
      "attrs": {
        "text": "Get Started",
        "url": "https://example.com",
        "alignment": "center",
        "variant": "filled",
        "borderRadius": "smooth",
        "buttonColor": "#000000",
        "textColor": "#ffffff",
        "showIfKey": null
      }
    }
  ]
}

Always include:
- Personalized greeting with subscriber.firstName in a paragraph
- Clear content structure with proper spacing using spacer elements
- Professional tone
- Call to action button with proper styling
- Proper variable usage with complete attrs objects
- All required attributes for each element type
- Only use allowed element types: paragraph, button, and spacer
- Ensure all attributes match their exact allowed values`;

export const IN_APP_CONTENT_PROMPT = `Generate in-app notification content that is concise and actionable.

Rules:
- Keep it short and clear
- Use {{subscriber.firstName}} for personalization
- Use {{payload.*}} for dynamic data
- Include call to action when relevant
- Use proper liquid syntax with {{ }}

Example: "Hi {{subscriber.firstName}}, your order #{{payload.orderNumber}} has been shipped!"`;

export const PUSH_CONTENT_PROMPT = `Generate push notification content that is attention-grabbing but professional.

Rules:
- Keep it under 140 characters
- Use {{subscriber.firstName}} for personalization
- Use {{payload.*}} for dynamic data
- Be direct and clear
- Use proper liquid syntax with {{ }}

Example: "{{subscriber.firstName}}, your order is out for delivery!"`;

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
