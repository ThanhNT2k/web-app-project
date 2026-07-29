const { StoryCollaborator, Wallet } = require('../models');

async function getChapterAccess(user, chapter) {
  if (!chapter?.is_paid) {
    return { canRead: true, isUnlocked: false, reason: 'FREE' };
  }
  if (!user?.id) {
    return { canRead: false, isUnlocked: false, reason: 'LOGIN_REQUIRED' };
  }
  if (
    user.role === 'Admin'
    || Number(user.id) === Number(chapter.story_author_id)
    || await StoryCollaborator.isCollaborator(chapter.story_id, user.id)
  ) {
    return { canRead: true, isUnlocked: false, reason: 'MANAGER' };
  }
  const isUnlocked = await Wallet.hasUnlocked(user.id, chapter.id);
  return { canRead: isUnlocked, isUnlocked, reason: isUnlocked ? 'UNLOCKED' : 'LOCKED' };
}

function lockedChapterResponse(chapter, crystalBalance = null) {
  return {
    success: false,
    code: 'CHAPTER_LOCKED',
    message: `Chương này cần ${Wallet.UNLOCK_COST} Tinh thạch để mở khóa.`,
    data: {
      chapter_id: chapter.id,
      story_id: chapter.story_id,
      chapter_number: chapter.chapter_number,
      title: chapter.title,
      story_title: chapter.story_title,
      story_slug: chapter.story_slug,
      unlock_cost: Wallet.UNLOCK_COST,
      crystal_balance: crystalBalance,
    },
  };
}

module.exports = { getChapterAccess, lockedChapterResponse };
