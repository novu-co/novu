import { Base62Id, ShortIsPrefixEnum, Slug, slugify } from '@novu/shared';

const SLUG_DELIMITER = '_';

/**
 * Builds a slug for a step based on the step name, the short prefix and the internal ID.
 * @returns The slug for the entity, example:  slug: "workflow-name_wf_AbC1Xyz9KlmNOpQr"
 */
export function buildSlug(entityName: string, shortIsPrefix: ShortIsPrefixEnum, shortId: string): Slug {
  const slugifiedEntityName = slugify(entityName);
  const clientId: `${ShortIsPrefixEnum}${Base62Id}` = `${shortIsPrefix}${shortId}`;

  return `${slugifiedEntityName}${SLUG_DELIMITER}${clientId}`;
}
