export const translations = {
  en: {
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    close: 'Close',
    search: 'Search',
    loading: 'Loading...',
    logout: 'Logout',
    
    // Login Page
    login: {
      title: 'BDE System Login',
      machineId: 'Machine ID',
      password: 'Password',
      loginButton: 'Login',
      enterMachineId: 'Enter Machine ID',
      enterPassword: 'Enter Password',
    },
    
    // Work Tracker
    tracker: {
      title: 'Work Tracker',
      selectUser: 'Select User',
      partNumber: 'Part Number',
      orderNumber: 'Order Number',
      performanceId: 'Performance ID',
      start: 'Start',
      stop: 'Stop',
      submit: 'Submit',
      workHistory: 'Work History',
      activeUsers: 'Active Users',
      noActiveUsers: 'No active users',
      timer: 'Timer',
      selectPartNumber: 'Select part number',
      selectOrderNumber: 'Select order number',
      selectPerformanceId: 'Select performance ID',
      typeToSearch: 'Type to search or scan...',
      removeUser: 'Remove User',
      confirmRemove: 'Are you sure you want to remove this user from the session?',
    },
    
    // Work History
    history: {
      title: 'Work History',
      lastEntries: 'Last 10 Entries',
      noEntries: 'No work history available',
      modified: 'Modified',
      duration: 'Duration',
      editEntry: 'Edit Work Entry',
      errorLoading: 'Error loading work history',
      retry: 'Retry',
    },
    
    // Admin Dashboard
    admin: {
      title: 'Admin Dashboard',
      settings: 'Settings',
      machines: 'BDE Machines',
      users: 'Users',
      partNumbers: 'Part Numbers',
      orderNumbers: 'Order Numbers',
      performanceIds: 'Performance IDs',
      addMachine: 'Add Machine',
      addUser: 'Add User',
      addPartNumber: 'Add Part Number',
      addOrderNumber: 'Add Order Number',
      addPerformanceId: 'Add Performance ID',
      machineId: 'Machine ID',
      department: 'Department',
      lastLogin: 'Last Login',
      admin: 'Admin',
      user: 'User',
      name: 'Name',
      image: 'Image',
      barcode: 'Barcode',
      description: 'Description',
      downloadPDF: 'Download PDF',
      downloadBarcodes: 'Download All Barcodes',
      isAdmin: 'Make this machine an administrator',
      selectImage: 'Select image',
      active: 'Active',
      inactive: 'Inactive',
    },
    
    // Time formats
    time: {
      hours: 'h',
      minutes: 'm',
      seconds: 's',
    },
  },
  
  de: {
    // Common
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    add: 'Hinzufügen',
    close: 'Schließen',
    search: 'Suchen',
    loading: 'Laden...',
    logout: 'Abmelden',
    
    // Login Page
    login: {
      title: 'BDE-System Anmeldung',
      machineId: 'Maschinen-ID',
      password: 'Passwort',
      loginButton: 'Anmelden',
      enterMachineId: 'Maschinen-ID eingeben',
      enterPassword: 'Passwort eingeben',
    },
    
    // Work Tracker
    tracker: {
      title: 'Arbeitserfassung',
      selectUser: 'Benutzer auswählen',
      partNumber: 'Teilenummer',
      orderNumber: 'Auftragsnummer',
      performanceId: 'Leistungs-ID',
      start: 'Starten',
      stop: 'Stoppen',
      submit: 'Abschicken',
      workHistory: 'Arbeitsverlauf',
      activeUsers: 'Aktive Benutzer',
      noActiveUsers: 'Keine aktiven Benutzer',
      timer: 'Timer',
      selectPartNumber: 'Teilenummer wählen',
      selectOrderNumber: 'Auftragsnummer wählen',
      selectPerformanceId: 'Leistungs-ID wählen',
      typeToSearch: 'Zum Suchen oder Scannen eingeben...',
      removeUser: 'Benutzer entfernen',
      confirmRemove: 'Möchten Sie diesen Benutzer wirklich aus der Sitzung entfernen?',
    },
    
    // Work History
    history: {
      title: 'Arbeitsverlauf',
      lastEntries: 'Letzte 10 Einträge',
      noEntries: 'Kein Arbeitsverlauf verfügbar',
      modified: 'Geändert',
      duration: 'Dauer',
      editEntry: 'Arbeitseintrag bearbeiten',
      errorLoading: 'Fehler beim Laden des Arbeitsverlaufs',
      retry: 'Wiederholen',
    },
    
    // Admin Dashboard
    admin: {
      title: 'Admin-Dashboard',
      settings: 'Einstellungen',
      machines: 'BDE-Maschinen',
      users: 'Benutzer',
      partNumbers: 'Teilenummern',
      orderNumbers: 'Auftragsnummern',
      performanceIds: 'Leistungs-IDs',
      addMachine: 'Maschine hinzufügen',
      addUser: 'Benutzer hinzufügen',
      addPartNumber: 'Teilenummer hinzufügen',
      addOrderNumber: 'Auftragsnummer hinzufügen',
      addPerformanceId: 'Leistungs-ID hinzufügen',
      machineId: 'Maschinen-ID',
      department: 'Abteilung',
      lastLogin: 'Letzte Anmeldung',
      admin: 'Admin',
      user: 'Benutzer',
      name: 'Name',
      image: 'Bild',
      barcode: 'Barcode',
      description: 'Beschreibung',
      downloadPDF: 'PDF herunterladen',
      downloadBarcodes: 'Alle Barcodes herunterladen',
      isAdmin: 'Diese Maschine zum Administrator machen',
      selectImage: 'Bild auswählen',
      active: 'Aktiv',
      inactive: 'Inaktiv',
    },
    
    // Time formats
    time: {
      hours: 'Std',
      minutes: 'Min',
      seconds: 'Sek',
    },
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKeys = typeof translations['en'];
