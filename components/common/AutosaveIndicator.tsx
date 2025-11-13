import React from 'react';
import { CheckCircleIcon, ArrowPathIcon, ExclamationTriangleIcon } from '../Icons';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved';

interface AutosaveIndicatorProps {
  status: SaveStatus;
}

const AutosaveIndicator: React.FC<AutosaveIndicatorProps> = ({ status }) => {
    const isOnline = useOnlineStatus();

    if (!isOnline) {
        return (
            <div className="flex items-center gap-2 text-sm text-red-500 w-52">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span>Sin conexión — cambios locales</span>
            </div>
        );
    }

    let text: string;
    let icon: React.ReactNode = null;
    let color: string;

    switch (status) {
        case 'unsaved':
            text = 'Cambios sin guardar';
            color = 'text-gray-500 dark:text-gray-400';
            break;
        case 'saving':
            text = 'Guardando...';
            icon = <ArrowPathIcon className="w-4 h-4 animate-spin" />;
            color = 'text-yellow-500';
            break;
        case 'saved':
            text = 'Guardado';
            icon = <CheckCircleIcon className="w-5 h-5" />;
            color = 'text-green-500';
            break;
        default:
            return <div className="w-36">&nbsp;</div>;
    }

    return (
        <div className={`flex items-center gap-2 text-sm transition-all duration-300 ${color} w-36`}>
            {icon}
            <span>{text}</span>
        </div>
    );
};

export default AutosaveIndicator;