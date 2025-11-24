export const createObjectivesSlice = (set, get) => ({
  objectives: {
    minimumTradingDays: false,
    minimumProfitableDays: false,
    profitTarget: false,
    consistencyRule: false,
    dailyDrawdown: false,
    maxDrawdown: false,
    consistencyRuleBroken: false,
    maxDailyLossBroken: false,
    maxStaticLossBroken: false
  },

  updateObjective: (objectiveKey, status) => {
    set((state) => ({
      objectives: {
        ...state.objectives,
        [objectiveKey]: status
      }
    }))
  },

  updateBreakingRule: (ruleKey, broken) => {
    set((state) => ({
      objectives: {
        ...state.objectives,
        [ruleKey]: broken
      }
    }))
  },

  getChallengeStatus: () => {
    const state = get()
    const objectives = state.objectives

    const allObjectivesMet =
      objectives.minimumTradingDays &&
      objectives.minimumProfitableDays &&
      objectives.profitTarget &&
      objectives.consistencyRule &&
      objectives.dailyDrawdown &&
      objectives.maxDrawdown

    const anyBreakingRulesViolated =
      objectives.maxDailyLossBroken || objectives.maxStaticLossBroken

    if (allObjectivesMet) {
      return "Funded"
    } else if (anyBreakingRulesViolated) {
      return "failed"
    } else {
      return "in-progress"
    }
  },
})
