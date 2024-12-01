import { PageMeta } from '@/components/page-meta';
import { AuthCard } from '../components/auth/auth-card';
import { QuestionnaireForm } from '../components/auth/questionnaire-form';

export function QuestionnairePage() {
  return (
    <>
      <PageMeta title="Setup your workspace" />
      <AuthCard>
        <QuestionnaireForm />
      </AuthCard>
    </>
  );
}
