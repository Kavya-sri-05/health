import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const MedicationExpiryWarning = ({ medication }) => {
  if (!medication.endDate) {
    return null;
  }
  
  const today = new Date();
  const expiryDate = new Date(medication.endDate);
  const daysUntilExpiry = differenceInDays(expiryDate, today);
  
  // Color coding based on days until expiry
  let colorClass = '';
  let message = '';
  
  if (daysUntilExpiry < 0) {
    // Already expired
    colorClass = 'bg-gray-100 text-gray-500 border-gray-200';
    message = `Expired ${Math.abs(daysUntilExpiry)} days ago`;
  } else if (daysUntilExpiry <= 2) {
    // 0-2 days: red (urgent)
    colorClass = 'bg-red-100 text-red-700 border-red-200';
    message = daysUntilExpiry === 0 
      ? 'Expires today!' 
      : `Expires in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}`;
  } else if (daysUntilExpiry <= 7) {
    // 3-7 days: orange (warning)
    colorClass = 'bg-orange-100 text-orange-700 border-orange-200';
    message = `Expires in ${daysUntilExpiry} days`;
  } else if (daysUntilExpiry <= 14) {
    // 8-14 days: blue (notice)
    colorClass = 'bg-blue-100 text-blue-700 border-blue-200';
    message = `Expires in ${daysUntilExpiry} days`;
  } else {
    // 15+ days: green (good)
    colorClass = 'bg-green-100 text-green-700 border-green-200';
    message = `Expires in ${daysUntilExpiry} days`;
  }
  
  return (
    <div className={`flex items-center py-1 px-2 rounded-md border text-xs font-medium ${colorClass}`}>
      {daysUntilExpiry <= 7 ? (
        <AlertTriangle className="w-3 h-3 mr-1" />
      ) : (
        <Clock className="w-3 h-3 mr-1" />
      )}
      {message}
    </div>
  );
};

export default MedicationExpiryWarning;