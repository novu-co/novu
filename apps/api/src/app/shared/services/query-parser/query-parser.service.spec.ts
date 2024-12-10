import { RulesLogic, AdditionalOperation } from 'json-logic-js';
import { expect } from 'chai';

import { evaluateRules } from './query-parser.service';

describe('QueryParserService', () => {
  describe('Custom Operators', () => {
    describe('startsWith operator', () => {
      it('should return true when string starts with given value', () => {
        const rule: RulesLogic<AdditionalOperation> = { startsWith: [{ var: 'text' }, 'hello'] };
        const data = { text: 'hello world' };
        const { result, error } = evaluateRules(rule, data);
        expect(error).to.be.undefined;
        expect(result).to.be.true;
      });

      it('should return false when string does not start with given value', () => {
        const rule: RulesLogic<AdditionalOperation> = { startsWith: [{ var: 'text' }, 'world'] };
        const data = { text: 'hello world' };
        const { result, error } = evaluateRules(rule, data);
        expect(error).to.be.undefined;
        expect(result).to.be.false;
      });
    });

    describe('endsWith operator', () => {
      it('should return true when string ends with given value', () => {
        const rule: RulesLogic<AdditionalOperation> = { endsWith: [{ var: 'text' }, 'world'] };
        const data = { text: 'hello world' };
        const { result, error } = evaluateRules(rule, data);
        expect(error).to.be.undefined;
        expect(result).to.be.true;
      });

      it('should return false when string does not end with given value', () => {
        const rule: RulesLogic<AdditionalOperation> = { endsWith: [{ var: 'text' }, 'hello'] };
        const data = { text: 'hello world' };
        const { result, error } = evaluateRules(rule, data);
        expect(error).to.be.undefined;
        expect(result).to.be.false;
      });
    });

    describe('contains operator', () => {
      it('should return true when string contains given value', () => {
        const rule: RulesLogic<AdditionalOperation> = { contains: [{ var: 'text' }, 'llo wo'] };
        const data = { text: 'hello world' };
        const { result, error } = evaluateRules(rule, data);
        expect(error).to.be.undefined;
        expect(result).to.be.true;
      });

      it('should return false when string does not contain given value', () => {
        const rule: RulesLogic<AdditionalOperation> = { contains: [{ var: 'text' }, 'xyz'] };
        const data = { text: 'hello world' };
        const { result, error } = evaluateRules(rule, data);
        expect(error).to.be.undefined;
        expect(result).to.be.false;
      });
    });
  });

  describe('evaluateRules', () => {
    it('should handle invalid data types gracefully', () => {
      const rule: RulesLogic<AdditionalOperation> = { startsWith: [{ var: 'text' }, 123] };
      const data = { text: 'hello' };
      const { result, error } = evaluateRules(rule, data);
      expect(error).to.be.undefined;
      expect(result).to.be.false;
    });

    it('should throw error when safe mode is disabled', () => {
      const rule: RulesLogic<AdditionalOperation> = { invalid: 'operator' };
      const data = { text: 'hello' };
      expect(() => evaluateRules(rule, data, false)).to.throw('Failed to evaluate rule');
    });

    it('should return false and error when safe mode is enabled', () => {
      const rule: RulesLogic<AdditionalOperation> = { invalid: 'operator' };
      const data = { text: 'hello' };
      const { result, error } = evaluateRules(rule, data, true);
      expect(error).to.not.be.undefined;
      expect(result).to.be.false;
    });
  });
});
