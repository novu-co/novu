import { prompt as InquirerPrompt, type ListQuestionOptions, type Answers } from 'inquirer';

export async function prompt(questions: ListQuestionOptions[]): Promise<Answers> {
  return InquirerPrompt(questions);
}
