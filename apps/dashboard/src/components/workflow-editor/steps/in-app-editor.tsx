import { useState } from 'react';
import { RiEdit2Line, RiInformationFill, RiPencilRuler2Line } from 'react-icons/ri';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useNavigate } from 'react-router-dom';
import { useFormContext } from 'react-hook-form';
import * as z from 'zod';
import { liquid } from '@codemirror/lang-liquid';
import { EditorView } from '@uiw/react-codemirror';
import { RedirectTargetEnum } from '@novu/shared';

import { Button } from '@/components/primitives/button';
import { Separator } from '@/components/primitives/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/primitives/tabs';
import { Notification5Fill } from '@/components/icons';
import { AvatarPicker } from '@/components/primitives/form/avatar-picker';
import { InputField } from '@/components/primitives/input';
import { workflowSchema } from '../schema';
import { ActionPicker } from '../action-picker';
import { URLInput } from '@/components/primitives/url-input';
import { urlTargetTypes } from '@/utils/url';
import { Editor } from '@/components/primitives/editor';

const tabsContentClassName = 'h-full w-full px-3 py-3.5';

export const InAppEditor = () => {
  const navigate = useNavigate();
  const { formState } = useFormContext<z.infer<typeof workflowSchema>>();

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  return (
    <Tabs defaultValue="editor" className="flex h-full flex-1 flex-col">
      <header className="flex flex-row items-center gap-3 px-3 py-1.5">
        <div className="mr-auto flex items-center gap-2.5 text-sm font-medium">
          <RiEdit2Line className="size-4" />
          <span>Configure Template</span>
        </div>
        <TabsList className="w-min">
          <TabsTrigger value="editor" className="gap-1.5">
            <RiPencilRuler2Line className="size-5 p-0.5" />
            <span>Editor</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-1.5">
            <Notification5Fill className="size-5 p-0.5" />
            <span>Preview</span>
          </TabsTrigger>
        </TabsList>

        <Button
          variant="ghost"
          size="xs"
          className="size-6"
          onClick={() => {
            navigate('../', { relative: 'path' });
          }}
        >
          <Cross2Icon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </header>
      <Separator />
      <TabsContent value="editor" className={tabsContentClassName}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <RiPencilRuler2Line className="text-foreground-950 size-5 p-0.5 text-sm font-medium" />
            <span>In-app Template</span>
          </div>
          <div className="flex flex-col gap-1 rounded-xl border border-neutral-100 p-1">
            <div className="flex gap-1">
              <AvatarPicker />
              <InputField size="md" className="px-1">
                <Editor
                  placeholder="Subject"
                  size="md"
                  value={subject}
                  onChange={setSubject}
                  extensions={[
                    liquid({
                      variables: [{ type: 'variable', label: 'asdf' }],
                    }),
                    EditorView.lineWrapping,
                  ]}
                />
              </InputField>
            </div>
            <InputField size="md" className="h-32 px-1">
              <Editor
                placeholder="Body"
                size="md"
                value={body}
                onChange={setBody}
                extensions={[
                  liquid({
                    variables: [{ type: 'variable', label: 'asdf' }],
                  }),
                  EditorView.lineWrapping,
                ]}
              />
            </InputField>
            <div className="mt-1 flex items-center gap-1">
              <RiInformationFill className="text-foreground-400 size-4 p-0.5" />
              <span className="text-foreground-600 text-xs font-normal">
                {'This supports markdown and variables, type { for more.'}
              </span>
            </div>
            <ActionPicker
              value={{
                primaryAction: { label: 'Primary', redirect: { url: '', type: RedirectTargetEnum.BLANK } },
                secondaryAction: { label: 'Secondary', redirect: { url: '', type: RedirectTargetEnum.BLANK } },
              }}
              onChange={() => {}}
              className="mt-3"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label>Redirect URL</label>
            <URLInput
              options={urlTargetTypes}
              value={{ type: RedirectTargetEnum.BLANK, url: '' }}
              onChange={(val) => console.log(val)}
              placeholder="Redirect URL"
              size="md"
              asEditor
            />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="preview" className={tabsContentClassName}>
        <div>Preview</div>
      </TabsContent>
      <Separator />
      <footer className="flex justify-end px-3 py-3.5">
        <Button
          className="ml-auto"
          variant="default"
          type="submit"
          form="create-workflow"
          disabled={!formState.isDirty}
        >
          Save step
        </Button>
      </footer>
    </Tabs>
  );
};
