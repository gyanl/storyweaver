// Hero's Journey stage definitions
export const HERO_JOURNEY_STAGES = [
    {
        name: "Ordinary World",
        description: "Introduce the hero in their normal life before the adventure begins",
        stageNumber: 1,
    },
    {
        name: "Call to Adventure",
        description: "The hero is presented with a challenge, problem, or adventure",
        stageNumber: 2,
    },
    {
        name: "Refusal of the Call",
        description: "The hero hesitates or refuses the challenge due to fear or obligation",
        stageNumber: 3,
    },
    {
        name: "Meeting the Mentor",
        description: "The hero encounters a mentor who provides guidance, gifts, or training",
        stageNumber: 4,
    },
    {
        name: "Crossing the Threshold",
        description: "The hero commits to the adventure and enters the special world",
        stageNumber: 5,
    },
    {
        name: "Tests, Allies, Enemies",
        description: "The hero faces tests, makes allies, and confronts enemies",
        stageNumber: 6,
    },
    {
        name: "Approach to the Inmost Cave",
        description: "The hero approaches the central crisis or danger",
        stageNumber: 7,
    },
    {
        name: "Ordeal",
        description: "The hero faces their greatest fear or challenge - a life or death crisis",
        stageNumber: 8,
    },
    {
        name: "Reward",
        description: "The hero survives and gains the reward, treasure, or knowledge",
        stageNumber: 9,
    },
    {
        name: "The Road Back",
        description: "The hero begins the journey back to the ordinary world",
        stageNumber: 10,
    },
    {
        name: "Resurrection",
        description: "The hero faces a final test where everything is at stake",
        stageNumber: 11,
    },
    {
        name: "Return with the Elixir",
        description: "The hero returns home transformed, bringing something to help others",
        stageNumber: 12,
    },
];

export function getCurrentStage(pageNumber: number, targetPages: number = 10) {
    // Map page number to journey stage (0-11)
    const progress = pageNumber / targetPages;
    const stageIndex = Math.min(Math.floor(progress * 12), 11);
    return {
        index: stageIndex,
        stage: HERO_JOURNEY_STAGES[stageIndex],
        progress: progress,
    };
}

export function getStageForPage(pageNumber: number, targetPages: number = 10) {
    const { index, stage } = getCurrentStage(pageNumber, targetPages);
    return {
        current: stage,
        next: HERO_JOURNEY_STAGES[Math.min(index + 1, 11)],
        isNearingEnd: pageNumber >= targetPages * 0.8,
        shouldConclude: pageNumber >= targetPages,
    };
}
