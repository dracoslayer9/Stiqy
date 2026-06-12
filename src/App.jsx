import { useState, useMemo } from 'react';
import {
  IconSun,
  IconCalendarWeek,
  IconTarget,
  IconTelescope,
  IconClipboardCheck,
} from '@tabler/icons-react';
import { ToastProvider } from './components/Toast';
import DailyPage from './components/DailyPage';
import WeeklyPage from './components/WeeklyPage';
import OkrPage from './components/OkrPage';
import LongtermPage from './components/LongtermPage';
import ReviewPage from './components/ReviewPage';
import './index.css';

const TABS = [
  { key: 'daily', label: 'Daily', icon: IconSun },
  { key: 'weekly', label: 'Weekly', icon: IconCalendarWeek },
  { key: 'okr', label: 'OKR', icon: IconTarget },
  { key: 'longterm', label: 'Long-term', icon: IconTelescope },
  { key: 'review', label: 'Review', icon: IconClipboardCheck },
];

const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'Selamat pagi';
  if (hour >= 11 && hour < 15) return 'Selamat siang';
  if (hour >= 15 && hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

function getDateString() {
  const now = new Date();
  const day = DAYS_ID[now.getDay()];
  const date = now.getDate();
  const month = MONTHS_ID[now.getMonth()];
  const year = now.getFullYear();
  return `${day}, ${date} ${month} ${year}`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('daily');

  const greeting = useMemo(() => getGreeting(), []);
  const dateStr = useMemo(() => getDateString(), []);

  const renderPage = () => {
    switch (activeTab) {
      case 'daily': return <DailyPage />;
      case 'weekly': return <WeeklyPage />;
      case 'okr': return <OkrPage />;
      case 'longterm': return <LongtermPage />;
      case 'review': return <ReviewPage />;
      default: return <DailyPage />;
    }
  };

  return (
    <ToastProvider>
      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="greeting-text">{greeting} 👋</div>
          <div className="greeting-sub">{dateStr}</div>
        </header>

        {/* Tab navigation */}
        <nav className="tab-nav">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <Icon size={16} stroke={1.5} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Page content */}
        <main>
          {renderPage()}
        </main>
      </div>
    </ToastProvider>
  );
}
