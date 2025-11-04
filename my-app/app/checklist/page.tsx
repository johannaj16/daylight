'use client';

import VerticalNavbar from '../components/VerticalNavbar';
import TodoList from '../components/TodoList';
import Journal from '../components/Journal';
import WorkSessionList from '../components/WorkSessionList';

export default function ChecklistPage() {
  const todayKey = `journal:${new Date().toISOString().slice(0, 10)}`;
  const today = new Date();
  const formattedDate = today.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-white flex">
      <VerticalNavbar />
      <div className="flex flex-col flex-1 max-w-4xl mx-auto pt-4 pb-10">
        <div className="p-6 text-gray-500">
          <h1 className="text-2xl font-semibold">Today</h1>
          <h1 className="">{formattedDate}</h1>
          <div className="mt-2 h-0.5 bg-gray-200"></div>
        </div>
        <TodoList useDayStorage />
        <Journal storageKey={todayKey} />
        <WorkSessionList />
      </div>
    </div>
  );
}
