/**
 * Date Utils Unit Tests
 *
 * Tests for date formatting, comparison, and filtering functions.
 */

import { expect } from 'chai';

import {
  formatDate,
  parseDate,
  isToday,
  isPast,
  isUpcoming,
  getRelativeDateLabel
} from '../../../src/utils/date-utils.js';

describe('Date Utils', () => {
  describe('formatDate', () => {
    it('should format date to ISO 8601 format', () => {
      const date = new Date(2026, 2, 15); // March 15, 2026
      const formatted = formatDate(date);
      expect(formatted).to.equal('2026-03-15');
    });

    it('should pad single digit months and days', () => {
      const date = new Date(2026, 0, 5); // January 5, 2026
      const formatted = formatDate(date);
      expect(formatted).to.equal('2026-01-05');
    });

    it('should handle year boundary', () => {
      const date = new Date(2025, 11, 31); // December 31, 2025
      const formatted = formatDate(date);
      expect(formatted).to.equal('2025-12-31');
    });
  });

  describe('parseDate', () => {
    it('should parse ISO 8601 date string', () => {
      const date = parseDate('2026-03-15');
      expect(date.getFullYear()).to.equal(2026);
      expect(date.getMonth()).to.equal(2); // March (0-indexed)
      expect(date.getDate()).to.equal(15);
    });

    it('should handle single digit months and days', () => {
      const date = parseDate('2026-01-05');
      expect(date.getFullYear()).to.equal(2026);
      expect(date.getMonth()).to.equal(0); // January
      expect(date.getDate()).to.equal(5);
    });
  });

  describe('isToday', () => {
    it('should return true for today\'s date', () => {
      const today = formatDate(new Date());
      expect(isToday(today)).to.be.true;
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDate(yesterday);
      expect(isToday(yesterdayStr)).to.be.false;
    });

    it('should return false for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = formatDate(tomorrow);
      expect(isToday(tomorrowStr)).to.be.false;
    });
  });

  describe('isPast', () => {
    it('should return true for past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDate(yesterday);
      expect(isPast(yesterdayStr)).to.be.true;
    });

    it('should return false for today', () => {
      const today = formatDate(new Date());
      expect(isPast(today)).to.be.false;
    });

    it('should return false for future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = formatDate(tomorrow);
      expect(isPast(tomorrowStr)).to.be.false;
    });
  });

  describe('isUpcoming', () => {
    it('should return true for dates within 7 days', () => {
      const in3Days = new Date();
      in3Days.setDate(in3Days.getDate() + 3);
      const in3DaysStr = formatDate(in3Days);
      expect(isUpcoming(in3DaysStr)).to.be.true;
    });

    it('should return true for today', () => {
      const today = formatDate(new Date());
      expect(isUpcoming(today)).to.be.true;
    });

    it('should return false for dates beyond 7 days', () => {
      const in10Days = new Date();
      in10Days.setDate(in10Days.getDate() + 10);
      const in10DaysStr = formatDate(in10Days);
      expect(isUpcoming(in10DaysStr)).to.be.false;
    });

    it('should return false for past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDate(yesterday);
      expect(isUpcoming(yesterdayStr)).to.be.false;
    });
  });

  describe('getRelativeDateLabel', () => {
    it('should return "今天" for today', () => {
      const today = formatDate(new Date());
      expect(getRelativeDateLabel(today)).to.equal('今天');
    });

    it('should return "明天" for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = formatDate(tomorrow);
      // Calculate expected label dynamically
      const expectedLabel = '明天';
      expect(getRelativeDateLabel(tomorrowStr)).to.equal(expectedLabel);
    });

    it('should return "X 天后" for dates within a week', () => {
      const in5Days = new Date();
      in5Days.setDate(in5Days.getDate() + 5);
      const in5DaysStr = formatDate(in5Days);
      expect(getRelativeDateLabel(in5DaysStr)).to.equal('5 天后');
    });

    it('should return "已过期 X 天" for past dates', () => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - 3);
      const daysAgoStr = formatDate(daysAgo);
      expect(getRelativeDateLabel(daysAgoStr)).to.equal('已过期 3 天');
    });
  });
});
