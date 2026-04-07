import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { skillCategories } from '../registry/skillsConfig';

interface Props {
  playerId: number;
}

export default function SkillsProgressView({ playerId }: Props) {
  const history = useLiveQuery(
    () => db.contentHistory.where('playerId').equals(playerId).toArray(),
    [playerId],
    []
  );

  const completedIds = new Set(
    history.filter((h) => h.completed).map((h) => h.contentId)
  );
  const interactedIds = new Set(history.map((h) => h.contentId));

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
        Skills Progress
      </h3>

      {skillCategories.map((category) => {
        // Calculate overall category coverage
        const allContentIds = category.skills.flatMap((s) => s.contentIds);
        const uniqueIds = [...new Set(allContentIds)];
        const completedCount = uniqueIds.filter((id) => completedIds.has(id)).length;
        const exposedCount = uniqueIds.filter((id) => interactedIds.has(id)).length;
        const totalCount = uniqueIds.length;
        const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        return (
          <div key={category.id} className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{category.emoji}</span>
              <h4 className="font-bold text-gray-700 text-sm">{category.label}</h4>
              <span className="ml-auto text-xs text-gray-400 font-medium">{completionPct}%</span>
            </div>

            <div className="space-y-3">
              {category.skills.map((skill) => {
                const skillCompleted = skill.contentIds.filter((id) => completedIds.has(id)).length;
                const skillExposed = skill.contentIds.filter((id) => interactedIds.has(id)).length;
                const skillTotal = skill.contentIds.length;
                const pct = skillTotal > 0 ? Math.round((skillCompleted / skillTotal) * 100) : 0;
                const exposurePct = skillTotal > 0 ? Math.round((skillExposed / skillTotal) * 100) : 0;

                const isUnderPracticed = exposurePct < 20 && skillTotal > 0;

                return (
                  <div key={skill.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{skill.emoji}</span>
                        <span className={`text-xs font-medium ${isUnderPracticed ? 'text-amber-600' : 'text-gray-600'}`}>
                          {skill.label}
                          {isUnderPracticed && ' (needs practice)'}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {skillCompleted}/{skillTotal}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 relative">
                      {/* Exposure bar (lighter) */}
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full bg-gray-200"
                        initial={{ width: 0 }}
                        animate={{ width: `${exposurePct}%` }}
                        transition={{ duration: 0.5 }}
                      />
                      {/* Completion bar */}
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          backgroundColor: isUnderPracticed ? '#FF8C42' : '#4ECDC4',
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
