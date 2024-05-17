import { colors, IconInfoOutline, IconOutlineWarning, Tabs, Tooltip } from '@novu/design-system';
import { Accordion, Alert, Code, Loader, Paper } from '@mantine/core';
import { PropsWithChildren, ReactNode, useEffect, useMemo } from 'react';
import * as mdxBundler from 'mdx-bundler/client';
import { Highlight } from './Highlight';
import { useQuery } from '@tanstack/react-query';
import { useSegment } from '@novu/shared-web';
import { Center, Flex, Grid, GridItem, styled, VStack } from '../../styled-system/jsx';
import { css } from '../../styled-system/css';
import { text, title as RTitle } from '../../styled-system/recipes';
import { DOCS_URL, MDX_URL, MINTLIFY_IMAGE_URL } from './docs.const';

const Text = styled('p', text);
const LiText = styled('span', text);
const TitleH2 = styled('h2', RTitle);
const TitleH3 = styled('h3', RTitle);
const TitleH1 = styled('h1', RTitle);

const getMDXComponent = mdxBundler.getMDXComponent;

const wrapperId = 'embedded-docs';

/*
 *Render the mdx for our mintlify docs inside of the web.
 *Fetching the compiled mdx from another service and then try to map the markdown to react components.
 */
export const Docs = ({ path = '', children, actions }: PropsWithChildren<{ path?: string; actions: ReactNode }>) => {
  const segment = useSegment();

  const { isLoading, data: { code, title, description } = { code: '', title: '', description: '' } } = useQuery<{
    code: string;
    title: string;
    description: string;
  }>(['docs', path], async () => {
    const response = await fetch(MDX_URL + path);
    const json = await response.json();

    return json;
  });

  useEffect(() => {
    segment.track('Inline docs opened', {
      documentationPage: path,
      pageURL: window.location.href,
    });
  }, [path, segment]);

  const Component = useMemo(() => {
    if (code.length === 0) {
      return null;
    }

    return getMDXComponent(code);
  }, [code]);

  // Workaround for img tags that is not parsed correctly by mdx-bundler
  useEffect(() => {
    if (Component === null || isLoading) {
      return;
    }

    const docs = document.getElementById(wrapperId);

    if (!docs) {
      return;
    }

    const images = Array.from(docs.getElementsByTagName('img'));

    for (const img of images) {
      if (img.src.startsWith(MINTLIFY_IMAGE_URL)) {
        continue;
      }

      const url = new URL(img.src);
      img.src = `${MINTLIFY_IMAGE_URL}${url.pathname}`;
    }
  }, [Component, isLoading]);

  if (isLoading) {
    return (
      <Center
        className={css({
          marginTop: '[4rem]',
        })}
      >
        <Loader color={colors.error} size={32} />
      </Center>
    );
  }

  if (Component === null) {
    return (
      <Flex
        className={css({
          marginTop: '[4rem]',
        })}
        justify="center"
        align="center"
      >
        <Text>We could not load the documentation for you. Please try again.</Text>
        {children}
      </Flex>
    );
  }

  return (
    <>
      <VStack
        alignItems="unset"
        id={wrapperId}
        gap="75"
        className={css({
          textAlign: 'justify left',
        })}
      >
        <div>
          <Flex justify="space-between" align="center">
            <TitleH1>{title}</TitleH1>
            {actions}
          </Flex>
          <Text>{description}</Text>
        </div>
        <Component
          components={{
            tr: ({ className, ...props }: any) => {
              return (
                <tr
                  {...props}
                  className={css({
                    height: '250',
                    lineHeight: '125',
                    borderBottom: 'solid',
                    borderBottomColor: 'legacy.B20',
                  })}
                />
              );
            },
            thead: ({ className, ...props }: any) => {
              return (
                <thead
                  {...props}
                  className={css({
                    height: '150',
                    lineHeight: '125',
                    color: 'typography.text.main',
                    borderBottomColor: 'legacy.B30',
                  })}
                />
              );
            },
            Frame: ({ className, ...props }: any) => {
              return (
                <div {...props}>
                  <img alt="" src={`${MINTLIFY_IMAGE_URL}${props.children.props.src}`} />
                  <Text className={css({ textAlign: 'center', fontStyle: 'italic' })}>{props.caption}</Text>
                </div>
              );
            },
            Info: ({ className, ...props }: any) => {
              return (
                <Alert
                  className={css({
                    borderRadius: '75',
                    backgroundColor: 'mauve.60.dark !important',
                    '& p': {
                      color: 'white !important',
                    },
                  })}
                  {...props}
                  icon={<IconInfoOutline className={css({ color: 'white !important' })} />}
                />
              );
            },
            Snippet: () => {
              return null;
            },
            Steps: ({ className, ...props }: any) => {
              return (
                <ol
                  className={css({
                    lineHeight: '125',
                    listStyleType: 'decimal',
                    listStylePosition: 'inside',
                  })}
                >
                  {props.children}
                </ol>
              );
            },
            Step: ({ className, ...props }: any) => {
              return (
                <li className={css({ lineHeight: '125', marginBottom: '50' })}>
                  <LiText className={css({ lineHeight: '150', fontSize: '100', fontWeight: 'bolder' })}>
                    {props.title}
                  </LiText>
                  <LiText className={css({ lineHeight: '125' })}>{props.children}</LiText>
                </li>
              );
            },
            Warning: ({ className, ...props }: any) => {
              return (
                <Alert
                  className={css({
                    borderRadius: '75',
                    backgroundColor: 'amber.60.dark !important',
                    '& p': {
                      color: 'white !important',
                    },
                  })}
                  {...props}
                  icon={<IconOutlineWarning className={css({ color: 'white !important' })} />}
                />
              );
            },
            Note: ({ className, ...props }: any) => {
              return (
                <Alert
                  className={css({
                    borderRadius: '75',
                    backgroundColor: 'blue.70.dark !important',
                    '& p': {
                      color: 'white !important',
                    },
                  })}
                  {...props}
                  icon={<IconInfoOutline className={css({ color: 'white !important' })} />}
                />
              );
            },
            CardGroup: ({ className, ...props }: any) => {
              return (
                <Grid gap={16} columns={props.cols}>
                  {props.children}
                </Grid>
              );
            },
            AccordionGroup: ({ className, ...props }: any) => {
              return <Accordion {...props} />;
            },
            Tab: () => null,
            Tabs: ({ className, ...props }: any) => {
              const tabs = Array.isArray(props.children) ? props.children : [props.children];

              return (
                <Tabs
                  menuTabs={tabs.map((tab) => {
                    return {
                      content: tab.props.children,
                      value: tab.props.title,
                    };
                  })}
                  defaultValue={tabs[0].props.title}
                />
              );
            },
            Tip: ({ className, ...props }: any) => {
              return (
                <Alert
                  className={css({
                    borderRadius: '75',
                    backgroundColor: 'mauve.60.dark !important',
                    '& p': {
                      color: 'white !important',
                    },
                  })}
                  {...props}
                  icon={<IconInfoOutline className={css({ color: 'white !important' })} />}
                />
              );
            },
            Tooltip: ({ className, ...props }: any) => {
              return (
                <Tooltip label={props.tip}>
                  <span>{props.children}</span>
                </Tooltip>
              );
            },
            code: ({ className, ...props }: any) => {
              if (className?.includes('language-')) {
                return <Highlight {...props} />;
              }

              return <Code {...props} />;
            },
            Card: ({ className, ...props }: any) => {
              return (
                <GridItem colSpan={1}>
                  <Paper>
                    <TitleH2>
                      <a href={`${DOCS_URL}${props.href}`} rel={'noopener noreferrer'} target={'_blank'}>
                        {props.title}
                      </a>
                    </TitleH2>
                  </Paper>
                </GridItem>
              );
            },
            Accordion: ({ className, ...props }: any) => {
              return (
                <Accordion.Item value={props.title}>
                  <Accordion.Control>{props.title}</Accordion.Control>
                  <Accordion.Panel>{props.children}</Accordion.Panel>
                </Accordion.Item>
              );
            },
            p: ({ className, ...props }: any) => {
              return <Text className={css({ lineHeight: '125' })} {...props} />;
            },
            ol: ({ className, ...props }: any) => {
              return (
                <ol
                  className={css({
                    lineHeight: '125',
                    listStyleType: 'decimal',
                    listStylePosition: 'inside',
                    '& p': {
                      display: 'inline !important',
                    },
                  })}
                  {...props}
                />
              );
            },
            ul: ({ className, ...props }: any) => {
              return (
                <ul
                  className={css({
                    lineHeight: '125',
                    listStyleType: 'disc',
                    listStylePosition: 'inside',
                    '& p': {
                      display: 'inline !important',
                    },
                  })}
                  {...props}
                />
              );
            },
            li: ({ className, ...props }: any) => {
              return <li className={css({ lineHeight: '125', marginBottom: '50' })} {...props} />;
            },
            h2: ({ className, ...props }: any) => {
              return <TitleH2 className={css({ marginTop: '75' })} {...props} />;
            },
            h3: ({ className, ...props }: any) => {
              return <TitleH3 {...props} />;
            },
            a: ({ className, ...props }: any) => {
              return (
                <a
                  href={`${DOCS_URL}${props.href}`}
                  rel={'noopener noreferrer'}
                  target={'_blank'}
                  children={props.children}
                />
              );
            },
          }}
        />
      </VStack>
      {children}
    </>
  );
};
