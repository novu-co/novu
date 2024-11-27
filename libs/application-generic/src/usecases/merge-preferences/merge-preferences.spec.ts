import {
  DEFAULT_WORKFLOW_PREFERENCES,
  PreferencesTypeEnum,
} from '@novu/shared';
import { MergePreferencesCommand } from './merge-preferences.command';
import { MergePreferences } from './merge-preferences.usecase';

const DEFAULT_WORKFLOW_PREFERENCES_WITH_EMAIL_DISABLED = {
  ...DEFAULT_WORKFLOW_PREFERENCES,
  channels: {
    ...DEFAULT_WORKFLOW_PREFERENCES.channels,
    email: { enabled: false },
  },
};

type TestCase = {
  types: PreferencesTypeEnum[];
  expectedType: PreferencesTypeEnum;
  readOnly: boolean;
  comment: string;
  subscriberOverrides?: boolean;
};

// test cases
const testCases: TestCase[] = [
  // readOnly false scenarios
  {
    comment: 'Workflow resource only',
    types: [PreferencesTypeEnum.WORKFLOW_RESOURCE],
    expectedType: PreferencesTypeEnum.WORKFLOW_RESOURCE,
    readOnly: false,
  },
  {
    comment: 'Subscriber workflow overrides workflow resource',
    types: [
      PreferencesTypeEnum.WORKFLOW_RESOURCE,
      PreferencesTypeEnum.SUBSCRIBER_WORKFLOW,
    ],
    expectedType: PreferencesTypeEnum.SUBSCRIBER_WORKFLOW,
    readOnly: false,
  },
  {
    comment: 'Subscriber global overrides workflow resource',
    types: [
      PreferencesTypeEnum.WORKFLOW_RESOURCE,
      PreferencesTypeEnum.SUBSCRIBER_GLOBAL,
    ],
    expectedType: PreferencesTypeEnum.SUBSCRIBER_GLOBAL,
    readOnly: false,
  },
  {
    comment: 'Subscriber workflow overrides subscriber global',
    types: [
      PreferencesTypeEnum.WORKFLOW_RESOURCE,
      PreferencesTypeEnum.SUBSCRIBER_GLOBAL,
      PreferencesTypeEnum.SUBSCRIBER_WORKFLOW,
    ],
    expectedType: PreferencesTypeEnum.SUBSCRIBER_WORKFLOW,
    readOnly: false,
  },
  {
    comment: 'User workflow has priority over workflow resource',
    types: [
      PreferencesTypeEnum.WORKFLOW_RESOURCE,
      PreferencesTypeEnum.USER_WORKFLOW,
    ],
    expectedType: PreferencesTypeEnum.USER_WORKFLOW,
    readOnly: false,
  },
  {
    comment: 'User workflow overrides workflow resource',
    types: [
      PreferencesTypeEnum.WORKFLOW_RESOURCE,
      PreferencesTypeEnum.USER_WORKFLOW,
      PreferencesTypeEnum.SUBSCRIBER_WORKFLOW,
    ],
    expectedType: PreferencesTypeEnum.SUBSCRIBER_WORKFLOW,
    readOnly: false,
  },
  {
    comment: 'Subscriber global overrides user workflow',
    types: [
      PreferencesTypeEnum.WORKFLOW_RESOURCE,
      PreferencesTypeEnum.USER_WORKFLOW,
      PreferencesTypeEnum.SUBSCRIBER_GLOBAL,
    ],
    expectedType: PreferencesTypeEnum.SUBSCRIBER_GLOBAL,
    readOnly: false,
  },
  {
    comment: 'Subscriber workflow overrides user workflow',
    types: [
      PreferencesTypeEnum.WORKFLOW_RESOURCE,
      PreferencesTypeEnum.USER_WORKFLOW,
      PreferencesTypeEnum.SUBSCRIBER_GLOBAL,
      PreferencesTypeEnum.SUBSCRIBER_WORKFLOW,
    ],
    expectedType: PreferencesTypeEnum.SUBSCRIBER_WORKFLOW,
    readOnly: false,
  },
  // readOnly true scenarios
  {
    comment: 'Workflow resource readOnly flag has priority over subscriber',
    types: [PreferencesTypeEnum.WORKFLOW_RESOURCE],
    expectedType: PreferencesTypeEnum.WORKFLOW_RESOURCE,
    readOnly: true,
  },
  {
    comment:
      'Workflow resource readOnly flag has priority over subscriber workflow',
    types: [
      PreferencesTypeEnum.WORKFLOW_RESOURCE,
      PreferencesTypeEnum.SUBSCRIBER_WORKFLOW,
    ],
    expectedType: PreferencesTypeEnum.WORKFLOW_RESOURCE,
    readOnly: true,
  },
  {
    comment:
      'Workflow resource readOnly flag has priority over subscriber global',
    types: [
      PreferencesTypeEnum.WORKFLOW_RESOURCE,
      PreferencesTypeEnum.SUBSCRIBER_GLOBAL,
    ],
    expectedType: PreferencesTypeEnum.WORKFLOW_RESOURCE,
    readOnly: true,
  },
  {
    comment: 'User workflow readOnly flag has priority over workflow resource',
    types: [
      PreferencesTypeEnum.WORKFLOW_RESOURCE,
      PreferencesTypeEnum.USER_WORKFLOW,
    ],
    expectedType: PreferencesTypeEnum.USER_WORKFLOW,
    readOnly: true,
  },
  // Subscriber overrides behavior
  {
    comment: 'Subscriber workflow overrides workflow resource',
    types: [
      PreferencesTypeEnum.WORKFLOW_RESOURCE,
      PreferencesTypeEnum.SUBSCRIBER_WORKFLOW,
    ],
    expectedType: PreferencesTypeEnum.SUBSCRIBER_WORKFLOW,
    readOnly: false,
    subscriberOverrides: true,
  },
  {
    comment: 'Subscriber global overrides workflow resource',
    types: [
      PreferencesTypeEnum.WORKFLOW_RESOURCE,
      PreferencesTypeEnum.SUBSCRIBER_GLOBAL,
    ],
    expectedType: PreferencesTypeEnum.SUBSCRIBER_GLOBAL,
    readOnly: false,
    subscriberOverrides: true,
  },
  {
    comment: 'Subscriber workflow overrides user workflow',
    types: [
      PreferencesTypeEnum.WORKFLOW_RESOURCE,
      PreferencesTypeEnum.USER_WORKFLOW,
      PreferencesTypeEnum.SUBSCRIBER_WORKFLOW,
    ],
    expectedType: PreferencesTypeEnum.SUBSCRIBER_WORKFLOW,
    readOnly: false,
    subscriberOverrides: true,
  },
  {
    comment: 'Subscriber global overrides user workflow',
    types: [
      PreferencesTypeEnum.WORKFLOW_RESOURCE,
      PreferencesTypeEnum.USER_WORKFLOW,
      PreferencesTypeEnum.SUBSCRIBER_GLOBAL,
    ],
    expectedType: PreferencesTypeEnum.SUBSCRIBER_GLOBAL,
    readOnly: false,
    subscriberOverrides: true,
  },
];

describe('MergePreferences', () => {
  describe('merging readOnly and subscriberOverrides', () => {
    testCases.forEach(
      ({
        types,
        expectedType,
        readOnly,
        subscriberOverrides = false,
        comment = '',
      }) => {
        it(`should merge preferences for types: ${types.join(', ')} with readOnly: ${readOnly}${comment ? ` (${comment})` : ''}`, () => {
          const preferences = types.map((type, index) => ({
            _id: `${index + 1}`,
            _organizationId: '1',
            _environmentId: '1',
            type,
            preferences: {
              // default
              ...DEFAULT_WORKFLOW_PREFERENCES,
              // readOnly
              all: { ...DEFAULT_WORKFLOW_PREFERENCES.all, readOnly },
              // subscriber overrides
              ...([
                PreferencesTypeEnum.SUBSCRIBER_GLOBAL,
                PreferencesTypeEnum.SUBSCRIBER_WORKFLOW,
              ].includes(type) && subscriberOverrides
                ? DEFAULT_WORKFLOW_PREFERENCES_WITH_EMAIL_DISABLED
                : {}),
            },
          }));

          const command = MergePreferencesCommand.create({ preferences });

          const result = MergePreferences.execute(command);

          const expectedPreferences = subscriberOverrides
            ? DEFAULT_WORKFLOW_PREFERENCES_WITH_EMAIL_DISABLED
            : {
                ...DEFAULT_WORKFLOW_PREFERENCES,
                all: { ...DEFAULT_WORKFLOW_PREFERENCES.all, readOnly },
              };

          expect(result).toEqual({
            preferences: expectedPreferences,
            type: expectedType,
            source: {
              [PreferencesTypeEnum.WORKFLOW_RESOURCE]: null,
              [PreferencesTypeEnum.USER_WORKFLOW]: null,
              [PreferencesTypeEnum.SUBSCRIBER_GLOBAL]: null,
              [PreferencesTypeEnum.SUBSCRIBER_WORKFLOW]: null,
              ...preferences.reduce((acc, pref) => {
                acc[pref.type] = pref.preferences;

                return acc;
              }, {}),
            },
          });
        });
      },
    );
  });

  it('should have test cases for all combinations of PreferencesTypeEnum', () => {
    // Function to generate all subsets of an array, ensuring requiredTypes are included
    function generateSubsets(
      arr: PreferencesTypeEnum[],
      required: PreferencesTypeEnum[],
    ) {
      return arr
        .reduce(
          (subsets, value) =>
            subsets.concat(subsets.map((set) => [value, ...set])),
          [[]] as PreferencesTypeEnum[][],
        )
        .map((subset) => [...new Set([...required, ...subset])]);
    }

    const allTypes = Object.values(PreferencesTypeEnum);
    const requiredTypes = [PreferencesTypeEnum.WORKFLOW_RESOURCE];

    const allCombinations = generateSubsets(allTypes, requiredTypes).filter(
      (subset) => subset.length > 0,
    );

    const coveredCombinations = testCases.map((testCase) =>
      testCase.types.sort().join(','),
    );

    allCombinations.forEach((combination) => {
      const combinationKey = combination.sort().join(',');
      expect(coveredCombinations).toContain(combinationKey);
    });
  });

  it('should throw an error if no preferences are provided', () => {
    const command = MergePreferencesCommand.create({ preferences: [] });

    expect(() => MergePreferences.execute(command)).toThrow(
      'No preferences were found for merge',
    );
  });
});
