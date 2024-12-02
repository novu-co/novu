import { expect } from 'chai';
import { extractTemplateVars } from './extract-template-variables';

describe('extractTemplateVars', () => {
  it('should extract simple variable names', () => {
    const template = '{{name}} {{age}}';
    const variables = extractTemplateVars(template);

    expect(variables).to.have.members(['name', 'age']);
  });

  it('should extract nested object paths', () => {
    const template = 'Hello {{user.profile.name}}, your address is {{user.address.street}}';
    const variables = extractTemplateVars(template);

    expect(variables).to.have.members(['user.profile.name', 'user.address.street']);
  });

  it('should handle multiple occurrences of the same variable', () => {
    const template = '{{user.name}} {{user.name}} {{user.name}}';
    const variables = extractTemplateVars(template);

    expect(variables).to.have.members(['user.name']);
  });

  it('should handle mixed content with HTML and variables', () => {
    const template = '<div>Hello {{user.name}}</div><span>{{status}}</span>';
    const variables = extractTemplateVars(template);

    expect(variables).to.have.members(['user.name', 'status']);
  });

  it('should handle whitespace in template syntax', () => {
    const template = '{{ user.name }} {{  status  }}';
    const variables = extractTemplateVars(template);

    expect(variables).to.have.members(['user.name', 'status']);
  });

  it('should handle empty template string', () => {
    const template = '';
    const variables = extractTemplateVars(template);

    expect(variables.length).to.equal(0);
  });

  it('should handle template with no variables', () => {
    const template = 'Hello World!';
    const variables = extractTemplateVars(template);

    expect(variables.length).to.equal(0);
  });

  it('should handle special characters in variable names', () => {
    const template = '{{special_var_1}} {{data-point}}';
    const variables = extractTemplateVars(template);

    expect(variables).to.have.members(['special_var_1', 'data-point']);
  });

  describe('Error handling', () => {
    it('should handle undefined input gracefully', () => {
      expect(() => extractTemplateVars(undefined as any)).to.not.throw();
      expect(extractTemplateVars(undefined as any)).to.have.lengthOf(0);
    });

    it('should handle non-string input gracefully', () => {
      expect(() => extractTemplateVars({} as any)).to.not.throw();
      expect(extractTemplateVars({} as any)).to.have.lengthOf(0);
    });
  });
});
