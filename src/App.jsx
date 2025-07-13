import React, { useState } from "react"

const App = () => {
  const [challengeConfig, setChallengeConfig] = useState({
    phases: 1,
    maxDrawdown: 10,
    dailyDrawdown: 5,
    isTrailing: false,
    targetProfit: 8
  })

  return (
    <div className="min-w-[300px] max-w-sm bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        Configure Challenge
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Phases
          </label>
          <select
            value={challengeConfig.phases}
            onChange={(e) =>
              setChallengeConfig((prev) => ({
                ...prev,
                phases: parseInt(e.target.value)
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={1}>1 Phase</option>
            <option value={2}>2 Phases</option>
            <option value={3}>3 Phases</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profit Target (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={challengeConfig.targetProfit}
            onChange={(e) =>
              setChallengeConfig((prev) => ({
                ...prev,
                targetProfit: parseFloat(e.target.value) || 8
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Drawdown (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={challengeConfig.maxDrawdown}
            onChange={(e) =>
              setChallengeConfig((prev) => ({
                ...prev,
                maxDrawdown: parseFloat(e.target.value) || 10
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Daily Drawdown (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={challengeConfig.dailyDrawdown}
            onChange={(e) =>
              setChallengeConfig((prev) => ({
                ...prev,
                dailyDrawdown: parseFloat(e.target.value) || 5
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Drawdown Type
          </label>
          <select
            value={challengeConfig.isTrailing ? "trailing" : "static"}
            onChange={(e) =>
              setChallengeConfig((prev) => ({
                ...prev,
                isTrailing: e.target.value === "trailing"
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="static">Static Drawdown</option>
            <option value="trailing">Trailing Drawdown</option>
          </select>
        </div>

        <button
          onClick={() => console.log("Saved config:", challengeConfig)}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  )
}

export default App
