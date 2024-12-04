import { expect } from 'chai';
import { extractLiquidTemplateVariables } from './liquid-parser';

describe('parseLiquidVariables', () => {
  it('should extract simple variable names', () => {
    const template = '{{name}} {{age}}';
    const { validVariables: variables } = extractLiquidTemplateVariables(template);

    expect(variables).to.have.members(['name', 'age']);
  });

  it('should extract nested object paths', () => {
    const template = 'Hello {{user.profile.name}}, your address is {{user.address.street}}';
    const { validVariables: variables } = extractLiquidTemplateVariables(template);

    expect(variables).to.have.members(['user.profile.name', 'user.address.street']);
  });

  it('should handle multiple occurrences of the same variable', () => {
    const template = '{{user.name}} {{user.name}} {{user.name}}';
    const { validVariables: variables } = extractLiquidTemplateVariables(template);

    expect(variables).to.have.members(['user.name']);
  });

  it('should handle mixed content with HTML and variables', () => {
    const template = '<div>Hello {{user.name}}</div><span>{{status}}</span>';
    const { validVariables: variables } = extractLiquidTemplateVariables(template);

    expect(variables).to.have.members(['user.name', 'status']);
  });

  it('should handle whitespace in template syntax', () => {
    const template = '{{ user.name }} {{  status  }}';
    const { validVariables: variables } = extractLiquidTemplateVariables(template);

    expect(variables).to.have.members(['user.name', 'status']);
  });

  it('should handle empty template string', () => {
    const template = '';
    const { validVariables: variables } = extractLiquidTemplateVariables(template);

    expect(variables.length).to.equal(0);
  });

  it('should handle template with no variables', () => {
    const template = 'Hello World!';
    const { validVariables: variables } = extractLiquidTemplateVariables(template);

    expect(variables).to.have.lengthOf(0);
  });

  it('should handle special characters in variable names', () => {
    const template = '{{special_var_1}} {{data-point}}';
    const { validVariables: variables } = extractLiquidTemplateVariables(template);

    expect(variables).to.have.members(['special_var_1', 'data-point']);
  });

  describe('Error handling', () => {
    it('should handle invalid liquid syntax gracefully', () => {
      const { validVariables: variables, invalidVariables: errors } = extractLiquidTemplateVariables(
        '{{invalid..syntax}} {{invalid2..syntax}}'
      );

      expect(variables).to.have.lengthOf(0);
      expect(errors).to.have.lengthOf(2);
      expect(errors[0].message).to.contain('expected "|" before filter');
      expect(errors[0].variable).to.equal('{{invalid..syntax}}');
      expect(errors[1].variable).to.equal('{{invalid2..syntax}}');
    });

    it('should handle invalid liquid syntax gracefully, return valid variables', () => {
      const { validVariables, invalidVariables: errors } = extractLiquidTemplateVariables(
        '{{subscriber.name}} {{invalid..syntax}}'
      );

      expect(validVariables).to.have.members(['subscriber.name']);
      expect(errors[0].message).to.contain('expected "|" before filter');
      expect(errors[0].variable).to.equal('{{invalid..syntax}}');
    });

    it('should handle undefined input gracefully', () => {
      expect(() => extractLiquidTemplateVariables(undefined as any)).to.not.throw();
      expect(extractLiquidTemplateVariables(undefined as any)).to.deep.equal({
        validVariables: [],
        invalidVariables: [],
      });
    });

    it('should handle non-string input gracefully', () => {
      expect(() => extractLiquidTemplateVariables({} as any)).to.not.throw();
      expect(extractLiquidTemplateVariables({} as any)).to.deep.equal({ validVariables: [], invalidVariables: [] });
    });
  });
});
