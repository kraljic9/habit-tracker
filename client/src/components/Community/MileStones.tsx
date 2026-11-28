import axios from "axios";
import { useEffect, useState } from "react";

export default function MileStones() {
  const [milestonesList, setMilestonesList] = useState<any>(null);

  useEffect(() => {
    const fetchMilestoneData = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:5000/api/community/milestones",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMilestonesList(response.data);
      } catch (err) {
        console.log("Error accured while fetching milestones data");
        console.log(err);
      }
    };

    fetchMilestoneData();
  }, []);

  async function addReaction(id: number) {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:5000/api/community/milestones/${id}/reactions`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMilestonesList((prev: any) => ({
        ...prev,
        milestones: prev.milestones.map((milestone: any) =>
          milestone.id === id
            ? {
                ...milestone,
                reaction_count: milestone.reaction_count + 1,
                liked_by_me: true,
              }
            : milestone
        ),
      }));
    } catch (err) {
      console.log("Error accured while fetching milestones data");
      console.log(err);
    }
  }

  async function removeReaction(id: number) {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:5000/api/community/milestones/${id}/reactions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMilestonesList((prev: any) => ({
        ...prev,
        milestones: prev.milestones.map((milestone: any) =>
          milestone.id === id
            ? {
                ...milestone,
                reaction_count: milestone.reaction_count - 1,
                liked_by_me: false,
              }
            : milestone
        ),
      }));
    } catch (err) {
      console.log("Error accured while fetching milestones data");
      console.log(err);
    }
  }

  console.log(milestonesList);

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md text-white">
      <h3 className="mb-4 text-sm font-medium text-slate-400">
        Milestone feed
      </h3>

      <div className="space-y-4">
        {milestonesList?.milestones?.map((milestone: any) => (
          <div
            key={milestone.id}
            className="flex items-start gap-3.5 border-b border-slate-800 pb-4 last:border-b-0 last:pb-0"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-950 text-sm font-semibold text-sky-400">
              {milestone.message?.[0]?.toUpperCase() ?? "M"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug text-slate-200">
                {milestone.message}
              </p>

              <div className="mt-2.5 flex items-center gap-2">
                {!milestone.liked_by_me ? (
                  <button
                    type="button"
                    onClick={() => addReaction(milestone.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:bg-slate-800"
                  >
                    <span>👏</span>
                    <span>{milestone.reaction_count}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => removeReaction(milestone.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/50 bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-300 transition hover:bg-amber-500/25"
                  >
                    <span>👏</span>
                    <span>{milestone.reaction_count}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}