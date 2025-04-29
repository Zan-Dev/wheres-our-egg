export const levelStatus = Array.from({ length: 8 }, (_, index) => ({
    unlocked: index === 0,
    completed: false,
    stars: 0
}));

export function unlockNextLevel(currentLevel) {
    if (currentLevel + 1 < levelStatus.length) {
        levelStatus[currentLevel + 1].unlocked = true;
    }
}

export function completeLevel(levelIndex, starEarned = 3) {
    levelStatus[levelIndex].completed = true;
    levelStatus[levelIndex].stars = starEarned;
}