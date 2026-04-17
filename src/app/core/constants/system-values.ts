export interface SystemValueOption {
  key: string;
  label: string;
  resolve: (user: any) => string;
}

export const SYSTEM_VALUES: SystemValueOption[] = [
  {
    key: 'TODAY_DATE',
    label: "Today's Date",
    resolve: () => new Date().toLocaleDateString('fr-FR')
  },
  {
    key: 'CURRENT_YEAR',
    label: 'Current Year',
    resolve: () => new Date().getFullYear().toString()
  },
  {
    key: 'CURRENT_MONTH',
    label: 'Current Month',
    resolve: () => new Date().toLocaleDateString('fr-FR', { month: 'long' })
  },
  {
    key: 'USER_FULLNAME',
    label: 'My Full Name',
    resolve: (user) => `${user.firstName} ${user.lastName}`
  },
  {
    key: 'USER_FIRSTNAME',
    label: 'My First Name',
    resolve: (user) => user.firstName
  },
  {
    key: 'USER_LASTNAME',
    label: 'My Last Name',
    resolve: (user) => user.lastName
  },
  {
    key: 'USER_EMAIL',
    label: 'My Email',
    resolve: (user) => user.email
  },
  {
    key: 'USER_DEPARTMENT',
    label: 'My Department',
    resolve: (user) => user.departmentName ?? ''
  }
];