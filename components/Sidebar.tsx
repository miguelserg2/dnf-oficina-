
import React from 'react';
import { Section } from '../types';
import { HomeIcon, CalendarIcon, DocumentTextIcon, ClipboardCheckIcon, PresentationChartBarIcon, XIcon, Cog6ToothIcon } from './Icons';
import Logo from './Logo';

interface SidebarProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navItems = [
  { section: Section.Dashboard, icon: HomeIcon, label: 'INICIO' },
  { section: Section.Calendar, icon: CalendarIcon, label: 'Calendario y Agenda' },
  { section: Section.Documents, icon: DocumentTextIcon, label: 'Documentos' },
  { section: Section.Tasks, icon: ClipboardCheckIcon, label: 'Tareas' },
  { section: Section.Reports, icon: PresentationChartBarIcon, label: 'Informes' },
  { section: Section.Settings, icon: Cog6ToothIcon, label: 'Ajustes' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, isOpen, setIsOpen }) => {
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      ></div>

      <aside className={`w-64 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-gray-700
                         fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                         ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
              <Logo className="h-8 w-auto"/>
              <span className="font-semibold text-lg text-gray-800 dark:text-gray-200 tracking-tight">OFFICE VIRTUAL DNF</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-4">
          <ul>
            {navItems.map((item) => (
              <li key={item.section}>
                <button
                  onClick={() => {
                    setActiveSection(item.section)
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-2 my-1 text-left rounded-lg transition-colors duration-200 ${
                    activeSection === item.section
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500">OFFICE VIRTUAL DNF © 2024</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;