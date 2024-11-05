import { useMemo, useState } from 'react';
import { RiSendPlaneFill } from 'react-icons/ri';
import { useFormContext, useWatch } from 'react-hook-form';
import { loadLanguage } from '@uiw/codemirror-extensions-langs';
import type { WorkflowResponseDto } from '@novu/shared';
import { Code2 } from '../../icons/code-2';
import { Panel, PanelContent, PanelHeader } from '../../primitives/panel';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../primitives/form/form';
import { Input, InputField } from '../../primitives/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../primitives/tabs';
import { capitalize } from '@/utils/string';
import {
  type CodeSnippet,
  createCurlSnippet,
  createFrameworkSnippet,
  createGoSnippet,
  createNodeJsSnippet,
  createPhpSnippet,
  createPythonSnippet,
} from '@/utils/code-snippets';
import { CopyButton } from '../../primitives/copy-button';
import { TestWorkflowFormType } from '../schema';
import { SnippetLanguage } from './types';
import { SnippetEditor } from './snippet-editor';
import { Editor } from '@/components/primitives/editor';

const tabsTriggerClassName = 'pt-1';
const codePanelClassName = 'bg-background h-full w-full rounded-lg border border-neutral-200 p-3';

const LANGUAGE_TO_SNIPPET_UTIL: Record<SnippetLanguage, (props: CodeSnippet) => string> = {
  shell: createCurlSnippet,
  framework: createFrameworkSnippet,
  typescript: createNodeJsSnippet,
  php: createPhpSnippet,
  go: createGoSnippet,
  python: createPythonSnippet,
};

export const TestWorkflowForm = ({ workflow }: { workflow?: WorkflowResponseDto }) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<TestWorkflowFormType>();
  const [activeSnippetTab, setActiveSnippetTab] = useState<SnippetLanguage>('framework');
  const to = useWatch({ name: 'to', control });
  const payload = useWatch({ name: 'payload', control });
  const identifier = workflow?.workflowId ?? '';
  const snippetValue = useMemo(() => {
    const snippetUtil = LANGUAGE_TO_SNIPPET_UTIL[activeSnippetTab];
    return snippetUtil({ identifier, to, payload });
  }, [activeSnippetTab, identifier, to, payload]);

  return (
    <div className="flex h-full w-full flex-1 flex-col gap-3 p-3">
      <div className="flex flex-1 flex-col gap-3 xl:flex-row">
        <div className="flex-1">
          <Panel className="h-full">
            <PanelHeader>
              <RiSendPlaneFill className="size-4" />
              <span className="text-neutral-950">Send to</span>
            </PanelHeader>
            <PanelContent className="flex flex-col gap-2">
              {Object.keys(to).map((key) => (
                <FormField
                  key={key}
                  control={control}
                  name={`to.${key}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor={key}>{capitalize(key)}</FormLabel>
                      <FormControl>
                        <InputField state={errors.to?.[key] ? 'error' : 'default'}>
                          <Input id={key} {...(field as any)} />
                        </InputField>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </PanelContent>
          </Panel>
        </div>
        <div className="flex-[2_2_0%]">
          <FormField
            control={control}
            name="payload"
            render={({ field: { ref: _ref, ...restField } }) => (
              <FormItem className="h-full">
                <FormControl>
                  <Panel className="h-full">
                    <PanelHeader>
                      <Code2 className="size-5" />
                      <span className="text-neutral-950">Payload</span>
                    </PanelHeader>
                    <PanelContent>
                      <Editor
                        lang="json"
                        className="h-full"
                        basicSetup={{ lineNumbers: true }}
                        extensions={[loadLanguage('json')?.extension ?? []]}
                        {...restField}
                      />
                    </PanelContent>
                    <FormMessage />
                  </Panel>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
      <div className="flex-1">
        <Panel className="h-full">
          <Tabs
            className="flex h-full flex-1 flex-col border-none"
            value={activeSnippetTab}
            onValueChange={(value) => setActiveSnippetTab(value as SnippetLanguage)}
          >
            <TabsList className="border-t-0" variant="regular">
              <TabsTrigger className={tabsTriggerClassName} value="framework" variant="regular">
                Framework
              </TabsTrigger>
              <TabsTrigger className={tabsTriggerClassName} value="shell" variant="regular">
                cURL
              </TabsTrigger>
              <TabsTrigger className={tabsTriggerClassName} value="typescript" variant="regular">
                NodeJS
              </TabsTrigger>
              <TabsTrigger className={tabsTriggerClassName} value="php" variant="regular">
                PHP
              </TabsTrigger>
              <TabsTrigger className={tabsTriggerClassName} value="go" variant="regular">
                Golang
              </TabsTrigger>
              <TabsTrigger className={tabsTriggerClassName} value="python" variant="regular">
                Python
              </TabsTrigger>
              <CopyButton
                variant="ghost"
                size="sm"
                className="text-foreground-400 ml-auto font-normal"
                content={snippetValue}
                value="Copy code"
              />
            </TabsList>
            <TabsContent value="framework" className={codePanelClassName} variant="regular">
              <SnippetEditor language="framework" value={snippetValue} />
            </TabsContent>
            <TabsContent value="shell" className={codePanelClassName} variant="regular">
              <SnippetEditor language="shell" value={snippetValue} />
            </TabsContent>
            <TabsContent value="typescript" className={codePanelClassName} variant="regular">
              <SnippetEditor language="typescript" value={snippetValue} />
            </TabsContent>
            <TabsContent value="php" className={codePanelClassName} variant="regular">
              <SnippetEditor language="php" value={snippetValue} />
            </TabsContent>
            <TabsContent value="go" className={codePanelClassName} variant="regular">
              <SnippetEditor language="go" value={snippetValue} />
            </TabsContent>
            <TabsContent value="python" className={codePanelClassName} variant="regular">
              <SnippetEditor language="python" value={snippetValue} />
            </TabsContent>
          </Tabs>
        </Panel>
      </div>
    </div>
  );
};
