import { describe, expect, it } from 'vitest';

import {
  getReportActions,
  getReportTargetType,
  REPORT_REASONS_BY_TARGET,
  REPORT_TARGETS,
} from './reportConstants';

describe('report constants', () => {
  it('uses comment-specific reasons when a comment is reported', () => {
    const target = getReportTargetType({ commentId: 12, chapterId: 4 });

    expect(target).toBe(REPORT_TARGETS.COMMENT);
    expect(REPORT_REASONS_BY_TARGET[target]).toHaveProperty('COMMENT_HARASSMENT');
    expect(REPORT_REASONS_BY_TARGET[target]).toHaveProperty('AVATAR_INAPPROPRIATE');
    expect(REPORT_REASONS_BY_TARGET[target]).not.toHaveProperty('BROKEN_IMAGE');
  });

  it('offers avatar removal only for an avatar report', () => {
    const avatarActions = getReportActions({
      reason: 'AVATAR_INAPPROPRIATE',
      comment_id: 12,
      reported_user_id: 7,
    });

    expect(avatarActions).toContain('REMOVE_REPORTED_AVATAR');
    expect(avatarActions).not.toContain('REJECT_COMMENT');
  });

  it('only exposes processing actions suitable for the report target', () => {
    const commentActions = getReportActions({ comment_id: 12, story_id: 3 });
    const chapterActions = getReportActions({ chapter_id: 8, story_id: 3 });

    expect(commentActions).toContain('REJECT_COMMENT');
    expect(commentActions).toContain('FLAG_COMMENT_SPAM');
    expect(commentActions).not.toContain('HIDE_STORY');
    expect(chapterActions).toContain('UNPUBLISH_CHAPTER');
    expect(chapterActions).not.toContain('REJECT_COMMENT');
  });
});
