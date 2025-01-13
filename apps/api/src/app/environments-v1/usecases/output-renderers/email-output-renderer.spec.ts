import { Test } from '@nestjs/testing';
import { expect } from 'chai';
import { TipTapNode } from '@novu/shared';
import { EmailOutputRendererUsecase } from './email-output-renderer.usecase';
import { ExpandEmailEditorSchemaUsecase } from './expand-email-editor-schema.usecase';
import { HydrateEmailSchemaUseCase } from './hydrate-email-schema.usecase';
import { FullPayloadForRender } from './render-command';

describe('EmailOutputRendererUsecase', () => {
  let emailOutputRendererUsecase: EmailOutputRendererUsecase;
  let expandEmailEditorSchemaUseCase: ExpandEmailEditorSchemaUsecase;
  let hydrateEmailSchemaUseCase: HydrateEmailSchemaUseCase;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [EmailOutputRendererUsecase, ExpandEmailEditorSchemaUsecase, HydrateEmailSchemaUseCase],
    }).compile();

    emailOutputRendererUsecase = moduleRef.get<EmailOutputRendererUsecase>(EmailOutputRendererUsecase);
    expandEmailEditorSchemaUseCase = moduleRef.get<ExpandEmailEditorSchemaUsecase>(ExpandEmailEditorSchemaUsecase);
    hydrateEmailSchemaUseCase = moduleRef.get<HydrateEmailSchemaUseCase>(HydrateEmailSchemaUseCase);
  });

  const mockFullPayload: FullPayloadForRender = {
    subscriber: { email: 'test@email.com' },
    payload: {},
    steps: {} as Record<string, unknown>,
  };

  describe('general flow', () => {
    it('should return subject and body when body is not string', async () => {
      let renderCommand = {
        controlValues: {
          subject: 'Test Subject',
          body: undefined,
        },
        fullPayloadForRender: mockFullPayload,
      };

      let result = await emailOutputRendererUsecase.execute(renderCommand);

      expect(result).to.deep.equal({
        subject: 'Test Subject',
        body: undefined,
      });

      renderCommand = {
        controlValues: {
          subject: 'Test Subject',
          body: 123 as any,
        },
        fullPayloadForRender: mockFullPayload,
      };

      result = await emailOutputRendererUsecase.execute(renderCommand);

      expect(result).to.deep.equal({
        subject: 'Test Subject',
        body: 123,
      });
    });

    it('should process simple text with liquid variables', async () => {
      const mockTipTapNode: TipTapNode = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Hello {{payload.name}}',
              },
            ],
          },
        ],
      };

      const renderCommand = {
        controlValues: {
          subject: 'Welcome Email',
          body: JSON.stringify(mockTipTapNode),
        },
        fullPayloadForRender: {
          ...mockFullPayload,
          payload: { name: 'John' },
        },
      };

      const result = await emailOutputRendererUsecase.execute(renderCommand);

      expect(result).to.have.property('subject', 'Welcome Email');
      expect(result.body).to.include('Hello John');
    });

    it('should handle nested object variables with liquid syntax', async () => {
      const mockTipTapNode: TipTapNode = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Hello {{payload.user.name}}, your order #{{payload.order.id}} status is {{payload.order.status}}',
              },
            ],
          },
        ],
      };

      const renderCommand = {
        controlValues: {
          subject: 'Order Update',
          body: JSON.stringify(mockTipTapNode),
        },
        fullPayloadForRender: {
          ...mockFullPayload,
          payload: {
            user: { name: 'John Doe' },
            order: { id: '12345', status: 'shipped' },
          },
        },
      };

      const result = await emailOutputRendererUsecase.execute(renderCommand);

      expect(result).to.have.property('subject', 'Order Update');
      expect(result.body).to.include('Hello John Doe');
      expect(result.body).to.include('your order #12345');
      expect(result.body).to.include('status is shipped');
    });

    it('should handle liquid variables with default values', async () => {
      const mockTipTapNode: TipTapNode = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: `Hello {{payload.name | default: 'valued customer'}}`,
              },
            ],
          },
        ],
      };

      const renderCommand = {
        controlValues: {
          subject: 'Welcome',
          body: JSON.stringify(mockTipTapNode),
        },
        fullPayloadForRender: {
          ...mockFullPayload,
          payload: {},
        },
      };

      const result = await emailOutputRendererUsecase.execute(renderCommand);

      expect(result).to.have.property('subject', 'Welcome');
      expect(result.body).to.include('Hello valued customer');
    });
  });

  describe('variable node transformation to text', () => {
    it('should handle maily variables', async () => {
      const mockTipTapNode: TipTapNode = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Welcome ',
              },
              {
                type: 'variable',
                attrs: {
                  id: 'payload.name',
                },
              },
              {
                type: 'text',
                text: '! Your order ',
              },
              {
                type: 'variable',
                attrs: {
                  id: 'payload.order.number',
                },
              },
              {
                type: 'text',
                text: ' has been ',
              },
              {
                type: 'variable',
                attrs: {
                  id: 'payload.order.status',
                },
              },
            ],
          },
        ],
      };

      const renderCommand = {
        controlValues: {
          subject: 'Order Status',
          body: JSON.stringify(mockTipTapNode),
        },
        fullPayloadForRender: {
          ...mockFullPayload,
          payload: {
            name: 'John',
            order: {
              number: '#12345',
              status: 'shipped',
            },
          },
        },
      };

      const result = await emailOutputRendererUsecase.execute(renderCommand);

      expect(result.subject).to.equal('Order Status');
      expect(result.body).to.include('Welcome');
      expect(result.body).to.include('John');
      expect(result.body).to.include('Your order');
      expect(result.body).to.include('#12345');
      expect(result.body).to.include('has been');
      expect(result.body).to.include('shipped');
    });

    it('should handle maily variables with fallback values', async () => {
      const mockTipTapNode: TipTapNode = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Hello ',
              },
              {
                type: 'variable',
                attrs: {
                  id: 'payload.name',
                  fallback: 'valued customer',
                },
              },
              {
                type: 'text',
                text: '! Your ',
              },
              {
                type: 'variable',
                attrs: {
                  id: 'payload.subscription.tier',
                  fallback: 'free',
                },
              },
              {
                type: 'text',
                text: ' subscription will expire in ',
              },
              {
                type: 'variable',
                attrs: {
                  id: 'payload.subscription.daysLeft',
                  fallback: '30',
                },
              },
              {
                type: 'text',
                text: ' days.',
              },
            ],
          },
        ],
      };

      const renderCommand = {
        controlValues: {
          subject: 'Subscription Update',
          body: JSON.stringify(mockTipTapNode),
        },
        fullPayloadForRender: {
          ...mockFullPayload,
          payload: {}, // Empty payload to test fallback values
        },
      };

      const result = await emailOutputRendererUsecase.execute(renderCommand);

      expect(result.subject).to.equal('Subscription Update');
      expect(result.body).to.include('Hello');
      expect(result.body).to.include('valued customer');
      expect(result.body).to.include('Your');
      expect(result.body).to.include('free');
      expect(result.body).to.include('subscription');
      expect(result.body).to.include('expire in');
      expect(result.body).to.include('30');
      expect(result.body).to.include('days');

      // Test with partial data
      const renderCommandWithPartialData = {
        controlValues: {
          subject: 'Subscription Update',
          body: JSON.stringify(mockTipTapNode),
        },
        fullPayloadForRender: {
          ...mockFullPayload,
          payload: {
            name: 'John',
            subscription: {
              tier: 'premium',
            },
          },
        },
      };

      const resultWithPartialData = await emailOutputRendererUsecase.execute(renderCommandWithPartialData);

      expect(resultWithPartialData.body).to.include('Hello');
      expect(resultWithPartialData.body).to.include('John'); // variable
      expect(resultWithPartialData.body).to.include('Your');
      expect(resultWithPartialData.body).to.include('premium'); // variable
      expect(resultWithPartialData.body).to.include('subscription');
      expect(resultWithPartialData.body).to.include('expire in');
      expect(resultWithPartialData.body).to.include('30');
      expect(resultWithPartialData.body).to.include('days');
    });
  });

  describe('conditional block transformation (showIfKey)', () => {
    it('should render content when showIfKey condition is true', async () => {
      const mockTipTapNode: TipTapNode = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Before condition',
              },
              {
                type: 'section',
                attrs: {
                  showIfKey: 'payload.isPremium',
                },
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'Premium content',
                      },
                    ],
                  },
                ],
              },
              {
                type: 'text',
                text: 'After condition',
              },
            ],
          },
        ],
      };

      const renderCommand = {
        controlValues: {
          subject: 'Conditional Test',
          body: JSON.stringify(mockTipTapNode),
        },
        fullPayloadForRender: {
          ...mockFullPayload,
          payload: {
            isPremium: true,
          },
        },
      };

      const result = await emailOutputRendererUsecase.execute(renderCommand);

      expect(result.body).to.include('Before condition');
      expect(result.body).to.include('Premium content');
      expect(result.body).to.include('After condition');
    });

    it('should not render content when showIfKey condition is false', async () => {
      const mockTipTapNode: TipTapNode = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Before condition',
              },
              {
                type: 'section',
                attrs: {
                  showIfKey: 'payload.isPremium',
                },
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'Premium content',
                      },
                    ],
                  },
                ],
              },
              {
                type: 'text',
                text: 'After condition',
              },
              {
                type: 'text',
                text: 'After condition 2',
              },
            ],
          },
        ],
      };

      const renderCommand = {
        controlValues: {
          subject: 'Conditional Test',
          body: JSON.stringify(mockTipTapNode),
        },
        fullPayloadForRender: {
          ...mockFullPayload,
          payload: {
            isPremium: false,
          },
        },
      };

      const result = await emailOutputRendererUsecase.execute(renderCommand);

      expect(result.body).to.include('Before condition');
      expect(result.body).to.not.include('Premium content');
      expect(result.body).to.include('After condition');
      expect(result.body).to.include('After condition 2');
    });

    it('should handle nested conditional blocks correctly', async () => {
      const mockTipTapNode: TipTapNode = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'section',
                attrs: {
                  showIfKey: 'payload.isSubscribed',
                },
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'Subscriber content',
                      },
                      {
                        type: 'section',
                        attrs: {
                          showIfKey: 'payload.isPremium',
                        },
                        content: [
                          {
                            type: 'paragraph',
                            content: [
                              {
                                type: 'text',
                                text: 'Premium content',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const renderCommand = {
        controlValues: {
          subject: 'Nested Conditional Test',
          body: JSON.stringify(mockTipTapNode),
        },
        fullPayloadForRender: {
          ...mockFullPayload,
          payload: {
            isSubscribed: true,
            isPremium: true,
          },
        },
      };

      let result = await emailOutputRendererUsecase.execute(renderCommand);
      expect(result.body).to.include('Subscriber content');
      expect(result.body).to.include('Premium content');

      // Test with outer true, inner false
      renderCommand.fullPayloadForRender.payload = {
        isSubscribed: true,
        isPremium: false,
      };
      result = await emailOutputRendererUsecase.execute(renderCommand);
      expect(result.body).to.include('Subscriber content');
      expect(result.body).to.not.include('Premium content');

      // Test with outer false
      renderCommand.fullPayloadForRender.payload = {
        isSubscribed: false,
        isPremium: true,
      };
      result = await emailOutputRendererUsecase.execute(renderCommand);
      expect(result.body).to.not.include('Subscriber content');
      expect(result.body).to.not.include('Premium content');
    });
  });

  describe('for block transformation and expansion', () => {
    // Tests for for loop block transformation will be added here
  });

  describe('node attrs and marks attrs hydration', () => {
    it('should handle links with href attributes', async () => {
      const mockTipTapNode: TipTapNode = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Click ',
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'link',
                    attrs: {
                      href: 'payload.linkUrl',
                      target: '_blank',
                      isUrlVariable: true,
                    },
                  },
                ],
                text: 'here',
              },
              {
                type: 'text',
                text: ' to continue',
              },
            ],
          },
        ],
      };

      const renderCommand = {
        controlValues: {
          subject: 'Link Test',
          body: JSON.stringify(mockTipTapNode),
        },
        fullPayloadForRender: {
          ...mockFullPayload,
          payload: {
            linkUrl: 'https://example.com',
          },
        },
      };

      const result = await emailOutputRendererUsecase.execute(renderCommand);
      expect(result.body).to.include('href="https://example.com"');
      expect(result.body).to.include('target="_blank"');
      expect(result.body).to.include('>here</a>');
    });

    it('should handle image nodes with variable attributes', async () => {
      const mockTipTapNode: TipTapNode = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'image',
                attrs: {
                  src: 'payload.imageUrl',
                  isSrcVariable: true,
                },
              },
            ],
          },
        ],
      };

      const renderCommand = {
        controlValues: {
          subject: 'Image Test',
          body: JSON.stringify(mockTipTapNode),
        },
        fullPayloadForRender: {
          ...mockFullPayload,
          payload: {
            imageUrl: 'https://example.com/image.jpg',
          },
        },
      };

      const result = await emailOutputRendererUsecase.execute(renderCommand);
      expect(result.body).to.include('src="https://example.com/image.jpg"');
    });

    it('should handle marks attrs href', async () => {
      const mockTipTapNode: TipTapNode = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'link',
                    attrs: {
                      href: 'payload.href',
                      isUrlVariable: true,
                    },
                  },
                ],
                text: 'Colored text',
              },
            ],
          },
        ],
      };

      const renderCommand = {
        controlValues: {
          subject: 'Color Test',
          body: JSON.stringify(mockTipTapNode),
        },
        fullPayloadForRender: {
          ...mockFullPayload,
          payload: {
            href: 'https://example.com',
          },
        },
      };

      const result = await emailOutputRendererUsecase.execute(renderCommand);
      expect(result.body).to.include('href="https://example.com"');
    });
  });
});
