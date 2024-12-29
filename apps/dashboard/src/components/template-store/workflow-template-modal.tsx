import { ComponentProps, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/primitives/dialog';
import { Button } from '@/components/primitives/button';
import { Textarea } from '@/components/primitives/textarea';
import { Input, InputField } from '@/components/primitives/input';
import { useEnvironment } from '@/context/environment/hooks';
import { showToast } from '@/components/primitives/sonner-helpers';
import { ToastIcon } from '@/components/primitives/sonner';
import { postV2 } from '@/api/api.client';
import { CreateWorkflowButton } from '../create-workflow-button';
import { WorkflowCard } from './workflow-card';
import { WorkflowSidebar } from './workflow-sidebar';
import { RouteFill } from '../icons';
import { Form } from '../primitives/form/form';
import { useForm } from 'react-hook-form';
import { getTemplates } from './templates';
import { IWorkflowSuggestion } from './templates/types';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { Wand2 } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/primitives/hover-card';

const GENERATE_EXAMPLES = [
  {
    concept: 'Marketplace Platform',
    prompt: "We're building a marketplace platform connecting freelancers with clients",
  },
  {
    concept: 'E-commerce Store',
    prompt: 'We have an e-commerce store selling fashion products',
  },
  {
    concept: 'Learning Platform',
    prompt: "We're developing an online learning platform for students and teachers",
  },
  {
    concept: 'Analytics Dashboard',
    prompt: "We're creating a SaaS analytics dashboard for businesses",
  },
  {
    concept: 'Food Delivery App',
    prompt: 'We have a mobile app for food delivery services',
  },
  {
    concept: 'Social Network',
    prompt: "We're building a professional networking platform for developers",
  },
] as const;

const FROM_PROMPT_EXAMPLES = [
  {
    concept: 'Welcome Sequence',
    prompt:
      "Send a welcome email when user signs up, then an in-app message after 2 days if they haven't created a project",
  },
  {
    concept: 'Payment Recovery',
    prompt: 'When payment fails, send an email immediately and an SMS if not resolved in 24 hours',
  },
  {
    concept: 'Mention Notifications',
    prompt: 'Notify team members with email + slack when mentioned in comments, with a 5min delay to allow for edits',
  },
  {
    concept: 'Birthday Rewards',
    prompt: "Send birthday email on user's birthday at 9am their local time, with a special discount code",
  },
  {
    concept: 'Task Updates',
    prompt: 'When task status changes to "Done", notify assignee in-app and watchers via email',
  },
  {
    concept: 'Trial Expiration',
    prompt:
      'Send email 7 days before trial ends, then in-app notification 2 days before, and SMS on last day if not upgraded',
  },
] as const;

const LOADING_MESSAGES = [
  'Teaching AI about your business... 🎓',
  'Consulting with the notification experts... 📬',
  'Brainstorming with digital neurons... 🧠',
  'Untangling the notification spaghetti... 🍝',
  'Summoning the workflow wizards... 🧙‍♂️',
  'Doing some digital heavy lifting... 🏋️‍♂️',
  'Bribing the AI with virtual cookies... 🍪',
  'Training carrier pigeons for backup... 🐦',
  'Convincing robots to work overtime... 🤖',
  'Charging notification crystals... 🔮',
  'Negotiating with the spam filter... 📧',
  'Powering up the notification reactor... ⚡️',
] as string[];

interface LoadingSkeletonProps {
  loadingMessage: string;
}

const LoadingSkeleton = ({ loadingMessage }: LoadingSkeletonProps) => (
  <div className="flex flex-col gap-6 py-8">
    <div className="flex flex-col items-center gap-6 text-center">
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative h-12 w-12">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-gray-200"
            style={{ borderTopColor: 'var(--color-primary)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-1 rounded-full border-2 border-gray-100"
            style={{ borderTopColor: 'var(--color-primary-light)' }}
            animate={{ rotate: -180 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={loadingMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-gray-500 to-gray-700 bg-clip-text text-sm font-medium text-transparent"
          >
            {loadingMessage}
          </motion.span>
        </AnimatePresence>
      </motion.div>
      <div className="grid w-full grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="overflow-hidden rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2">
              <div className="h-4 w-2/3 rounded-full bg-gray-100" />
              <div className="h-8 w-full rounded-md bg-gray-50" />
              <div className="flex gap-2">
                {[1, 2].map((j) => (
                  <div key={j} className="h-6 w-6 rounded-md bg-gray-100" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

type WorkflowTemplateModalProps = ComponentProps<typeof DialogTrigger>;

const WORKFLOW_TEMPLATES = getTemplates();

export enum WorkflowMode {
  TEMPLATES = 'templates',
  GENERATE = 'generate',
  FROM_PROMPT = 'from_prompt',
}

export function WorkflowTemplateModal(props: WorkflowTemplateModalProps) {
  const form = useForm();
  const [selectedCategory, setSelectedCategory] = useState<string>('popular');
  const [suggestions, setSuggestions] = useState<IWorkflowSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<WorkflowMode>(WorkflowMode.TEMPLATES);
  const { currentEnvironment } = useEnvironment();
  const [loadingMessage, setLoadingMessage] = useState<string>(LOADING_MESSAGES[0]);

  const filteredTemplates = WORKFLOW_TEMPLATES.filter((template) => template.category === selectedCategory);
  const templates = suggestions.length > 0 ? suggestions : filteredTemplates;

  const handleSubmit = async () => {
    if (!prompt) return;

    setIsGenerating(true);
    try {
      const { data } = await postV2<{ data: { suggestions: IWorkflowSuggestion[] } }>('/workflows/suggestions', {
        environment: currentEnvironment!,
        body: { prompt, mode: mode === WorkflowMode.FROM_PROMPT ? 'single' : 'multiple' },
      });
      setSuggestions(data.suggestions);
    } catch (error) {
      showToast({
        children: () => (
          <>
            <ToastIcon variant="error" />
            <span className="text-sm">
              Failed to generate suggestions:{' '}
              {error instanceof Error ? error.message : 'There was an error generating workflow suggestions.'}
            </span>
          </>
        ),
        options: {
          position: 'bottom-right',
        },
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      setLoadingMessage((prev) => {
        const currentIndex = LOADING_MESSAGES.indexOf(prev);
        const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
        return LOADING_MESSAGES[nextIndex];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isGenerating]);

  const getHeaderText = () => {
    if (suggestions.length > 0) {
      return mode === WorkflowMode.FROM_PROMPT ? 'Generated workflow' : 'AI Suggested workflows';
    }
    if (mode === WorkflowMode.TEMPLATES) {
      return `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} workflows`;
    }
    return '';
  };

  return (
    <Dialog>
      <DialogTrigger asChild {...props} />

      <DialogContent className="w-full max-w-[1240px] p-0">
        <Form {...form}>
          <form>
            <DialogHeader className="border-stroke-soft flex flex-row gap-1 border-b p-3">
              <RouteFill className="size-5" />
              <div className="text-label-sm !mt-0">Create a workflow</div>
            </DialogHeader>
            <div className="flex h-[700px]">
              {/* Sidebar */}
              <div className="h-full w-[259px] border-r border-neutral-200">
                <WorkflowSidebar
                  selectedCategory={selectedCategory}
                  onCategorySelect={(category) => {
                    setSelectedCategory(category);
                    setSuggestions([]);
                    setMode(WorkflowMode.TEMPLATES);
                  }}
                  onGenerateClick={() => {
                    setSuggestions([]);
                    setPrompt('');
                    setMode(WorkflowMode.GENERATE);
                  }}
                  onFromPromptClick={() => {
                    setSuggestions([]);
                    setPrompt('');
                    setMode(WorkflowMode.FROM_PROMPT);
                  }}
                  mode={mode}
                />
              </div>

              {/* Main Content */}
              <div className="w-full flex-1 p-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <h2 className="text-label-md text-strong">{getHeaderText()}</h2>
                </div>

                {mode !== WorkflowMode.TEMPLATES && (
                  <div className="flex flex-col gap-6">
                    {suggestions.length > 0 && (
                      <div className="flex items-center gap-3">
                        <InputField>
                          <Input
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="text-xs"
                            placeholder="Describe your workflow..."
                            disabled={isGenerating}
                          />
                        </InputField>
                        <Button onClick={handleSubmit} size="sm" isLoading={isGenerating}>
                          Regenerate
                        </Button>
                      </div>
                    )}

                    {isGenerating ? (
                      <LoadingSkeleton loadingMessage={loadingMessage} />
                    ) : suggestions.length > 0 ? (
                      <div
                        className={`grid ${
                          mode === WorkflowMode.FROM_PROMPT ? 'mx-auto w-full max-w-xl grid-cols-1' : 'grid-cols-3'
                        } gap-4`}
                      >
                        {templates.map((template) => (
                          <CreateWorkflowButton key={template.id} asChild template={template.workflowDefinition}>
                            <WorkflowCard
                              name={template.name}
                              template={template.workflowDefinition}
                              description={template.description}
                              steps={template.workflowDefinition.steps.map((step) => step.type)}
                            />
                          </CreateWorkflowButton>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-6 px-4 py-6">
                        <div className="flex max-w-xl flex-col items-center gap-3 text-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50">
                            {mode === WorkflowMode.FROM_PROMPT ? (
                              <Wand2 className="text-primary h-6 w-6" />
                            ) : (
                              <Sparkles className="text-primary h-6 w-6" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {mode === WorkflowMode.FROM_PROMPT ? 'Generate from a prompt' : 'Create AI suggestions'}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {mode === WorkflowMode.FROM_PROMPT
                                ? 'Describe your workflow, and our AI will create it instantly'
                                : 'Describe your product, and our AI will craft personalized notification workflows tailored to your needs'}
                            </p>
                          </div>
                        </div>

                        <div className="w-full max-w-xl">
                          <Textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={
                              mode === WorkflowMode.FROM_PROMPT
                                ? 'e.g., Send a welcome email when a user signs up, followed by an in-app message after 24 hours...'
                                : "e.g., We're building a SaaS project management tool..."
                            }
                            className="min-h-[120px] text-sm"
                          />
                        </div>

                        <div className="flex w-full max-w-xl flex-col gap-3">
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                              <span className="bg-white px-2 text-gray-500">Try these examples</span>
                            </div>
                          </div>

                          <div className="relative">
                            <div className="flex flex-wrap gap-2">
                              {(mode === WorkflowMode.FROM_PROMPT ? FROM_PROMPT_EXAMPLES : GENERATE_EXAMPLES).map(
                                (example) => (
                                  <HoverCard key={example.prompt} openDelay={500}>
                                    <HoverCardTrigger asChild>
                                      <motion.button
                                        type="button"
                                        onClick={() => setPrompt(example.prompt)}
                                        className="group relative flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-left text-xs text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50"
                                      >
                                        <div className="rounded-md bg-gray-100 p-1">
                                          {mode === WorkflowMode.FROM_PROMPT ? (
                                            <Wand2 className="h-3 w-3 text-gray-500" />
                                          ) : (
                                            <Sparkles className="h-3 w-3 text-gray-500" />
                                          )}
                                        </div>
                                        <span>{example.concept}</span>
                                      </motion.button>
                                    </HoverCardTrigger>
                                    <HoverCardContent
                                      side="bottom"
                                      align="start"
                                      className="w-64 p-2 text-xs"
                                      sideOffset={5}
                                    >
                                      <div className="flex items-start gap-2">
                                        <div className="rounded-md bg-gray-100 p-1">
                                          <ArrowRight className="h-3 w-3 text-gray-500" />
                                        </div>
                                        <p className="text-gray-600">{example.prompt}</p>
                                      </div>
                                    </HoverCardContent>
                                  </HoverCard>
                                )
                              )}
                            </div>
                          </div>
                        </div>

                        <Button onClick={handleSubmit} size="lg" className="w-full max-w-xl" isLoading={isGenerating}>
                          {mode === WorkflowMode.FROM_PROMPT ? 'Generate Workflow' : 'Generate Suggestions'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {mode === WorkflowMode.TEMPLATES && (
                  <div className="grid grid-cols-3 gap-4 py-3 pt-3">
                    {templates.map((template) => (
                      <CreateWorkflowButton key={template.id} asChild template={template.workflowDefinition}>
                        <WorkflowCard
                          name={template.name}
                          template={template.workflowDefinition}
                          description={template.description}
                          steps={template.workflowDefinition.steps.map((step) => step.type)}
                        />
                      </CreateWorkflowButton>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
