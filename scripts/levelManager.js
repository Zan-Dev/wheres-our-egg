import { refreshLevelButtons } from "./component.js";

// export let unlockedLevels = [true, false, false, false, false, false, false, false];

export const levelStatus = Array.from({ length: 8 }, (_, index) => ({
    unlocked: index === 0,
    completed: false,
    stars: 0
}));

export function unlockNextLevel(currentLevel) {
    if (currentLevel + 1 < levelStatus.length) {
        levelStatus[currentLevel + 1].unlocked = true;
        console.log(`level${currentLevel + 1}`,levelStatus[1].unlocked);
        refreshLevelButtons();
    }
}

export function completeLevel(levelIndex, starEarned = 3) {
    levelStatus[levelIndex].completed = true;
    levelStatus[levelIndex].stars = starEarned;
}

export function isLevelUnlocked(index) {
    return levelStatus[index]?.unlocked ?? false;
}