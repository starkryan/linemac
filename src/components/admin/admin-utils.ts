// Admin utility functions and constants

interface AdminConfig {
  permissions: Record<string, string[]>;
  roles: Record<string, {
    name: string;
    permissions: string[];
    color: string;
  }>;
}

const allPermissions = [
  'view', 'create', 'edit', 'delete', 'approve', 'reject', 'export'
];

const ADMIN_CONFIG: AdminConfig = {
  permissions: {
    dashboard: ['view'],
    users: ['view', 'create', 'edit', 'delete'],
    requests: ['view', 'approve', 'reject', 'edit'],
    settings: ['view', 'edit'],
    reports: ['view', 'export']
  },
  roles: {
    super_admin: {
      name: "Super Admin",
      permissions: allPermissions,
      color: "bg-purple-100 text-purple-800"
    },
    admin: {
      name: "Admin",
      permissions: ['view', 'create', 'edit', 'approve', 'reject', 'export'],
      color: "bg-blue-100 text-blue-800"
    },
    moderator: {
      name: "Moderator",
      permissions: ['view', 'approve', 'reject'],
      color: "bg-green-100 text-green-800"
    },
    viewer: {
      name: "Viewer",
      permissions: ['view'],
      color: "bg-gray-100 text-gray-800"
    }
  }
};

export { ADMIN_CONFIG };

export const REQUEST_STATUSES = {
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
} as const;

export const REQUEST_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

export const REQUEST_TYPES = {
  NAME: 'name',
  ADDRESS: 'address',
  DOB: 'dob',
  PHONE: 'phone',
  PHOTO: 'photo',
  EMAIL: 'email'
} as const;

export const USER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  BANNED: 'banned'
} as const;

export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  suspended: 'bg-red-100 text-red-800',
  banned: 'bg-red-100 text-red-800'
} as const;

export const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
} as const;

// Format date utilities
export const formatDate = (date: string | Date, format: 'short' | 'long' = 'short'): string => {
  const d = new Date(date);
  if (format === 'long') {
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  return d.toLocaleDateString('en-IN');
};

export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const d = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return formatDate(date);
};

// Aadhaar display utility - show full number for admin
export const formatAadhaarNumber = (aadhaar: string): string => {
  if (!aadhaar || aadhaar.length !== 12) return aadhaar;
  return aadhaar; // Show full Aadhaar number for admin display
};

// Phone number masking utility
export const maskPhoneNumber = (phone: string): string => {
  if (!phone || phone.length < 10) return phone;
  return `XXXXXX ${phone.slice(-4)}`;
};

// Validation utilities
export const isValidAadhaar = (aadhaar: string): boolean => {
  return /^\d{12}$/.test(aadhaar);
};

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  return /^\+?[\d\s-]{10,15}$/.test(phone);
};

// File size formatter
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Currency formatter for Indian Rupees
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Permission checker
export const hasPermission = (
  userRole: keyof typeof ADMIN_CONFIG.roles,
  permission: string,
  action?: string
): boolean => {
  const role = ADMIN_CONFIG.roles[userRole];
  if (!role) return false;

  if (!action) {
    return role.permissions.includes(permission);
  }

  return role.permissions.includes(`${permission}_${action}`);
};

// Status change helper
export const getNextStatus = (
  currentStatus: keyof typeof REQUEST_STATUSES,
  action: 'approve' | 'reject' | 'cancel'
): keyof typeof REQUEST_STATUSES | null => {
  const statusTransitions: Record<string, Record<string, string>> = {
    pending: {
      approve: REQUEST_STATUSES.APPROVED,
      reject: REQUEST_STATUSES.REJECTED,
      cancel: REQUEST_STATUSES.CANCELLED
    },
    in_review: {
      approve: REQUEST_STATUSES.APPROVED,
      reject: REQUEST_STATUSES.REJECTED,
      cancel: REQUEST_STATUSES.CANCELLED
    },
    approved: {
      cancel: REQUEST_STATUSES.CANCELLED
    },
    rejected: {},
    cancelled: {}
  };

  const result = statusTransitions[currentStatus]?.[action] || null;
  return result as keyof typeof REQUEST_STATUSES | null;
};

// Search and filter utilities
export const searchInObject = (obj: any, searchTerm: string): boolean => {
  if (!searchTerm) return true;

  const searchLower = searchTerm.toLowerCase();
  return Object.values(obj).some(value => {
    if (typeof value === 'string') {
      return value.toLowerCase().includes(searchLower);
    }
    if (typeof value === 'number') {
      return value.toString().includes(searchLower);
    }
    return false;
  });
};

export const filterByDateRange = (
  items: any[],
  dateField: string,
  startDate: string,
  endDate: string
): any[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return items.filter(item => {
    const itemDate = new Date(item[dateField]);
    return itemDate >= start && itemDate <= end;
  });
};

// Export utilities
export const exportToCSV = (data: any[], filename: string): void => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',')
          ? `"${value}"`
          : value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Activity logger
export const logAdminActivity = (
  userId: string,
  action: string,
  resource: string,
  resourceId: string,
  details?: any
): void => {
  const activity = {
    userId,
    action,
    resource,
    resourceId,
    details,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    ipAddress: '' // This would need to be captured on the server
  };

  // In a real application, this would be sent to an audit log service
  console.log('Admin Activity:', activity);
};

// Local storage helpers for admin preferences
export const getAdminPreferences = (): any => {
  try {
    const prefs = localStorage.getItem('adminPreferences');
    return prefs ? JSON.parse(prefs) : {};
  } catch (error) {
    console.error('Error loading admin preferences:', error);
    return {};
  }
};

export const saveAdminPreferences = (preferences: any): void => {
  try {
    localStorage.setItem('adminPreferences', JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving admin preferences:', error);
  }
};