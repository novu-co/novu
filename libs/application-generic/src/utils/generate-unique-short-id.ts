import { ApiException } from './exceptions';

export async function generateUniqueId(
  initialCandidate: string,
  lookup: (candidate: string) => Promise<boolean>,
  idGenerator: () => string,
  context: string,
) {
  const maxAttempts = 3;
  let identifier = '';

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidateIdentifier =
      attempt === 0 ? initialCandidate : idGenerator();

    const isIdentifierExist = await lookup(candidateIdentifier);

    if (!isIdentifierExist) {
      identifier = candidateIdentifier;
      break;
    }
  }

  if (!identifier) {
    throw new ApiException(
      `Unable to generate a unique identifier. ${context}`,
    );
  }

  return identifier;
}
