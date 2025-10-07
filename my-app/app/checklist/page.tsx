'use client';

import VerticalNavbar from '../components/VerticalNavbar';
import TodoList from '../components/TodoList';
import Journal from '../components/Journal';
import WorkSessionList from '../components/WorkSessionList';

export default function ChecklistPage() {
  const todayKey = `journal:${new Date().toISOString().slice(0, 10)}`;

  return (
    <div className="min-h-screen bg-white flex">
      <VerticalNavbar />
      <div className="flex flex-col flex-1 max-w-4xl mx-auto">
        <div className="p-6 text-gray-500">
          <h1 className="text-2xl font-semibold">Today</h1>
          <h1 className="">10.06.2025</h1>
          <div className="mt-2 h-0.5 bg-gray-200"></div>
        </div>
        <TodoList />
        <Journal storageKey={todayKey} />
        <WorkSessionList />
      </div>
    </div>
  );
}
