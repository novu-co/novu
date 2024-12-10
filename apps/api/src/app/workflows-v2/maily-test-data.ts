export const forSnippet = {
  type: 'doc',
  content: [
    {
      type: 'for',
      attrs: {
        each: 'payload.food.items',
        isUpdatingKey: false,
      },
      content: [
        {
          type: 'paragraph',
          attrs: {
            textAlign: 'left',
          },
          content: [
            {
              type: 'text',
              text: 'this is a food item with name  ',
            },
            {
              type: 'payloadValue',
              attrs: {
                id: 'name',
                label: null,
              },
            },
            {
              type: 'text',
              text: ' ',
            },
          ],
        },
        {
          type: 'for',
          attrs: {
            each: 'payload.food.warnings',
            isUpdatingKey: false,
          },
          content: [
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  attrs: {
                    color: null,
                  },
                  content: [
                    {
                      type: 'paragraph',
                      attrs: {
                        textAlign: 'left',
                      },
                      content: [
                        {
                          type: 'payloadValue',
                          attrs: {
                            id: 'header',
                            label: null,
                          },
                        },
                        {
                          type: 'text',
                          text: ' ',
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

export function fullCodeSnippet(stepId?: string) {
  return {
    type: 'doc',
    content: [
      {
        type: 'logo',
        attrs: {
          src: 'https://maily.to/brand/logo.png',
          alt: null,
          title: null,
          'maily-component': 'logo',
          size: 'md',
          alignment: 'left',
        },
      },
      {
        type: 'spacer',
        attrs: {
          height: 'xl',
        },
      },
      {
        type: 'heading',
        attrs: {
          textAlign: 'left',
          level: 2,
        },
        content: [
          {
            type: 'text',
            marks: [
              {
                type: 'bold',
              },
            ],
            text: 'Discover Maily',
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          textAlign: 'left',
        },
        content: [
          {
            type: 'text',
            text: 'Are you ready to transform your email communication? Introducing Maily, the powerful emaly.',
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          textAlign: 'left',
        },
        content: [
          {
            type: 'text',
            text: 'Elevate your email communication with Maily! Click below to try it out:',
          },
        ],
      },
      {
        type: 'button',
        attrs: {
          text: 'Try Maily Now →',
          url: '',
          alignment: 'left',
          variant: 'filled',
          borderRadius: 'round',
          buttonColor: '#000000',
          textColor: '#ffffff',
        },
      },
      {
        type: 'section',
        attrs: {
          show: 'payload.params.isPayedUser',
          borderRadius: 0,
          backgroundColor: '#f7f7f7',
          align: 'left',
          borderWidth: 1,
          borderColor: '#e2e2e2',
          paddingTop: 5,
          paddingRight: 5,
          paddingBottom: 5,
          paddingLeft: 5,
          marginTop: 0,
          marginRight: 0,
          marginBottom: 0,
          marginLeft: 0,
        },
        content: [
          {
            type: 'paragraph',
            attrs: {
              textAlign: 'left',
            },
            content: [
              {
                type: 'variable',
                attrs: {
                  id: 'payload.hidden.section',
                  label: null,
                  fallback: 'should be the fallback value',
                },
              },
              {
                type: 'text',
                text: ' ',
              },
              {
                type: 'variable',
                attrs: {
                  id: 'subscriber.fullName',
                  label: null,
                  fallback: 'should be the fallback value',
                },
              },
            ],
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          textAlign: 'left',
        },
        content: [
          {
            type: 'text',
            text: 'Join our vibrant community of users and developers on GitHub, where Maily is an ',
          },
          {
            type: 'text',
            marks: [
              {
                type: 'link',
                attrs: {
                  href: 'https://github.com/arikchakma/maily.to',
                  target: '_blank',
                  rel: 'noopener noreferrer nofollow',
                  class: null,
                },
              },
              {
                type: 'italic',
              },
            ],
            text: 'open-source',
          },
          {
            type: 'text',
            text: " project. Together, we'll shape the future of email editing.",
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          textAlign: 'left',
        },
        content: [
          {
            type: 'text',
            text: '@this is a placeholder value of name payload.body|| ',
          },
          {
            type: 'variable',
            attrs: {
              id: 'payload.body',
              label: null,
              fallback: null,
            },
          },
          {
            type: 'text',
            text: ' |||the value should have been here',
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          textAlign: 'left',
        },
        content: [
          {
            type: 'text',
            text: 'this is a regular for block showing multiple comments:',
          },
        ],
      },
      {
        type: 'paragraph',
        attrs: {
          textAlign: 'left',
        },
        content: [
          {
            type: 'text',
            text: 'This will be two for each one in another column: ',
          },
        ],
      },
      {
        type: 'columns',
        attrs: {
          width: '100%',
        },
        content: [
          {
            type: 'column',
            attrs: {
              columnId: '394bcc6f-c674-4d56-aced-f3f54434482e',
              width: 50,
              verticalAlign: 'top',
              borderRadius: 0,
              backgroundColor: 'transparent',
              borderWidth: 0,
              borderColor: 'transparent',
              paddingTop: 0,
              paddingRight: 0,
              paddingBottom: 0,
              paddingLeft: 0,
            },
            content: [
              {
                type: 'for',
                attrs: {
                  each: stepId ? `steps.${stepId}.events` : 'payload.origins',
                  isUpdatingKey: false,
                },
                content: [
                  {
                    type: 'orderedList',
                    attrs: {
                      start: 1,
                    },
                    content: [
                      {
                        type: 'listItem',
                        attrs: {
                          color: null,
                        },
                        content: [
                          {
                            type: 'paragraph',
                            attrs: {
                              textAlign: 'left',
                            },
                            content: [
                              {
                                type: 'text',
                                text: 'a list item: ',
                              },
                              {
                                type: 'payloadValue',
                                attrs: {
                                  id: stepId ? 'payload.country' : 'origin.country',
                                  label: null,
                                },
                              },
                              {
                                type: 'payloadValue',
                                attrs: {
                                  id: 'id',
                                  label: null,
                                },
                              },
                              {
                                type: 'payloadValue',
                                attrs: {
                                  id: 'time',
                                  label: null,
                                },
                              },
                              {
                                type: 'text',
                                text: ' ',
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
          {
            type: 'column',
            attrs: {
              columnId: 'a61ae45e-ea27-4a2b-a356-bfad769ea50f',
              width: 50,
              verticalAlign: 'top',
              borderRadius: 0,
              backgroundColor: 'transparent',
              borderWidth: 0,
              borderColor: 'transparent',
              paddingTop: 0,
              paddingRight: 0,
              paddingBottom: 0,
              paddingLeft: 0,
            },
            content: [
              {
                type: 'for',
                attrs: {
                  each: 'payload.students',
                  isUpdatingKey: false,
                },
                content: [
                  {
                    type: 'bulletList',
                    content: [
                      {
                        type: 'listItem',
                        attrs: {
                          color: null,
                        },
                        content: [
                          {
                            type: 'paragraph',
                            attrs: {
                              textAlign: 'left',
                            },
                            content: [
                              {
                                type: 'text',
                                text: 'bulleted list item: ',
                              },
                              {
                                type: 'payloadValue',
                                attrs: {
                                  id: 'id',
                                  label: null,
                                },
                              },
                              {
                                type: 'text',
                                text: '  and name: ',
                              },
                              {
                                type: 'payloadValue',
                                attrs: {
                                  id: 'name',
                                  label: null,
                                },
                              },
                              {
                                type: 'text',
                                text: ' ',
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: 'listItem',
                        attrs: {
                          color: null,
                        },
                        content: [
                          {
                            type: 'paragraph',
                            attrs: {
                              textAlign: 'left',
                            },
                            content: [
                              {
                                type: 'text',
                                text: 'buffer bullet item',
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
      },
      {
        type: 'paragraph',
        attrs: {
          textAlign: 'left',
        },
      },
      {
        type: 'paragraph',
        attrs: {
          textAlign: 'left',
        },
        content: [
          {
            type: 'text',
            text: 'This will be a nested for block',
          },
        ],
      },
      {
        type: 'for',
        attrs: {
          each: 'payload.food.items',
          isUpdatingKey: false,
        },
        content: [
          {
            type: 'paragraph',
            attrs: {
              textAlign: 'left',
            },
            content: [
              {
                type: 'text',
                text: 'this is a food item with name  ',
              },
              {
                type: 'payloadValue',
                attrs: {
                  id: 'name',
                  label: null,
                },
              },
              {
                type: 'text',
                text: ' ',
              },
            ],
          },
          {
            type: 'for',
            attrs: {
              each: 'payload.food.warnings',
              isUpdatingKey: false,
            },
            content: [
              {
                type: 'bulletList',
                content: [
                  {
                    type: 'listItem',
                    attrs: {
                      color: null,
                    },
                    content: [
                      {
                        type: 'paragraph',
                        attrs: {
                          textAlign: 'left',
                        },
                        content: [
                          {
                            type: 'payloadValue',
                            attrs: {
                              id: 'header',
                              label: null,
                            },
                          },
                          {
                            type: 'text',
                            text: ' ',
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
      {
        type: 'paragraph',
        attrs: {
          textAlign: 'left',
        },
      },
      {
        type: 'paragraph',
        attrs: {
          textAlign: 'left',
        },
        content: [
          {
            type: 'text',
            text: 'Regards,',
          },
          {
            type: 'hardBreak',
          },
          {
            type: 'text',
            text: 'Arikko',
          },
        ],
      },
    ],
  };
}
