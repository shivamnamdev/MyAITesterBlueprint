import React from 'react';
import KanbanColumn from './KanbanColumn.jsx';

const COLUMNS = [
  'To Search',
  'To Apply',
  'Applied',
  'Interviewing',
  'Offer',
  'Rejected'
];

export default function KanbanBoard({
  jobs,
  onAddJobForStage,
  onEditJob,
  onDeleteJob,
  onAssessMatch,
  onMoveStage
}) {
  return (
    <main className="px-4 lg:px-8 py-4 overflow-x-auto">
      <div className="max-w-[1600px] mx-auto flex items-start gap-5 pb-6">
        {COLUMNS.map(stage => {
          const stageJobs = jobs.filter(j => j.stage === stage);
          return (
            <KanbanColumn
              key={stage}
              stage={stage}
              jobs={stageJobs}
              onAddJobForStage={onAddJobForStage}
              onEditJob={onEditJob}
              onDeleteJob={onDeleteJob}
              onAssessMatch={onAssessMatch}
              onMoveStage={onMoveStage}
            />
          );
        })}
      </div>
    </main>
  );
}

