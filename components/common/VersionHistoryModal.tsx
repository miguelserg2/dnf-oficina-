import React, { useState } from 'react';
import { DocumentVersion } from '../../types';
import Modal from './Modal';
import { EyeIcon } from '../Icons';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: DocumentVersion[];
  currentContent: string;
  documentTitle: string;
}

const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ isOpen, onClose, history, currentContent, documentTitle }) => {
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | 'current' | null>('current');

  const versions = [
    { modifiedAt: new Date().toISOString(), content: currentContent, isCurrent: true },
    ...history,
  ].sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());

  const selectedContent = selectedVersion === 'current'
    ? currentContent
    : (selectedVersion as DocumentVersion)?.content;
    
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Historial de Versiones: ${documentTitle}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[70vh]">
        <div className="md:col-span-1 border-r pr-4 dark:border-gray-600 overflow-y-auto">
          <h3 className="font-semibold mb-2">Versiones</h3>
          <ul>
            {versions.map((version, index) => (
              <li key={version.modifiedAt + '-' + index}>
                <button
                  onClick={() => setSelectedVersion((version as any).isCurrent ? 'current' : version)}
                  className={`w-full text-left p-2 rounded-md mb-1 ${
                    (selectedVersion === 'current' && (version as any).isCurrent) || (selectedVersion as DocumentVersion)?.modifiedAt === version.modifiedAt
                    ? 'bg-indigo-100 dark:bg-indigo-900' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="font-medium">
                    {new Date(version.modifiedAt).toLocaleString()}
                  </span>
                  {(version as any).isCurrent && <span className="text-xs ml-2 bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200 px-1.5 py-0.5 rounded-full">Actual</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2 overflow-y-auto">
           <h3 className="font-semibold mb-2">Vista Previa del Contenido</h3>
           {selectedContent ? (
                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-md h-full">
                    {selectedContent}
                </div>
           ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                    <p>Selecciona una versión para ver su contenido.</p>
                </div>
           )}
        </div>
      </div>
    </Modal>
  );
};

export default VersionHistoryModal;
